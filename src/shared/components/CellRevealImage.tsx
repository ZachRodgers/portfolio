import React, { useEffect, useRef, useState } from 'react';
import './CellRevealImage.css';

export function squareCells(width: number, height: number, columns = 8) {
    columns = Math.max(1, Math.floor(columns));
    const size = width / columns;
    const rows = Math.ceil(height / size);
    return Array.from({ length: rows * columns }, (_, index) => {
        const row = Math.floor(index / columns);
        const noise = Math.sin((index + 1) * 12.9898) * 43758.5453;
        const random = noise - Math.floor(noise);
        const spread = Math.min(8, Math.max(3, rows * .55));
        return { x: (index % columns) * size, y: row * size, size, order: (row + random * spread) / (rows - 1 + spread) };
    });
}

export interface CellRevealImageProps {
    src: string;
    visible: boolean;
    alt?: string;
    className?: string;
    width?: number;
    height?: number;
    columns?: number;
    durationMs?: number;
    interactionDelayMs?: number;
    revealProgress?: number;
    exitProgress?: number;
}

// Place inside a positioned, clipped frame; progress values range from zero to one.
export default function CellRevealImage({
    src, visible, alt = '', className = '', width, height, columns = 8, durationMs = 250,
    revealProgress, exitProgress = 0, interactionDelayMs = 1000,
}: CellRevealImageProps) {
    const image = useRef<HTMLImageElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [localProgress, setLocalProgress] = useState(0);
    const [loadedSrc, setLoadedSrc] = useState<string>();
    const loaded = loadedSrc === src;
    const [hoverReady, setHoverReady] = useState(false);
    const [fallback, setFallback] = useState(false);
    const [settled, setSettled] = useState(false);
    const spawned = useRef(new Map<number, number>());
    const sampleCache = useRef<{ key: string; surface: HTMLCanvasElement }>();
    const progress = revealProgress ?? localProgress;
    const revealFinished = (progress >= 1 && settled) || fallback;
    const exiting = exitProgress > 0;
    const animating = visible && !fallback && (progress < 1 || !settled || exitProgress > 0);

    useEffect(() => {
        spawned.current.clear();
        sampleCache.current = undefined;
        setSettled(false);
        setFallback(false);
    }, [src]);

    useEffect(() => {
        if (!visible) {
            spawned.current.clear();
            setSettled(false);
        }
    }, [visible, src]);

    useEffect(() => {
        setHoverReady(false);
        if (!visible || !loaded || !revealFinished || exiting) return;
        const timer = setTimeout(() => setHoverReady(true), interactionDelayMs);
        return () => clearTimeout(timer);
    }, [visible, loaded, revealFinished, exiting, interactionDelayMs, src]);

    useEffect(() => {
        if (!visible) { setLocalProgress(0); return; }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setFallback(true);
            return;
        }
        if (revealProgress !== undefined) return;
        let frame = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const value = Math.min(1, (now - start) / Math.max(1, durationMs));
            setLocalProgress(value);
            if (value < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [visible, revealProgress, durationMs, src]);

    useEffect(() => {
        if (!animating) return;
        const element = image.current;
        const surface = canvas.current;
        if (!element || !surface) return;
        const context = surface.getContext('2d');
        if (!context) { setFallback(true); return; }
        if (!element.naturalWidth) return;
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        surface.width = Math.round(width * ratio);
        surface.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const scale = Math.max(width / element.naturalWidth, height / element.naturalHeight);
        const drawnWidth = element.naturalWidth * scale;
        const drawnHeight = element.naturalHeight * scale;
        const position = getComputedStyle(element).objectPosition.split(' ');
        const positionY = parseFloat(position[1] || '50') / 100;
        const offsetX = (width - drawnWidth) / 2;
        const offsetY = (height - drawnHeight) * positionY;
        const cells = squareCells(width, height, columns);
        const gridColumns = Math.max(1, Math.floor(columns));
        const sampleKey = `${src}:${width}:${height}:${columns}:${positionY}`;
        let sample = sampleCache.current?.key === sampleKey ? sampleCache.current.surface : undefined;
        if (!sample) {
            sample = document.createElement('canvas');
            sample.width = gridColumns;
            sample.height = Math.ceil(cells.length / gridColumns);
            const sampleContext = sample.getContext('2d');
            if (!sampleContext) { setFallback(true); return; }
            const cellSize = width / gridColumns;
            sampleContext.imageSmoothingEnabled = true;
            sampleContext.imageSmoothingQuality = 'high';
            sampleContext.drawImage(element, offsetX / cellSize, offsetY / cellSize, drawnWidth / cellSize, drawnHeight / cellSize);
            sampleCache.current = { key: sampleKey, surface: sample };
        }
        const sampledImage = sample;
        let frame = 0;
        const paint = (now: number) => {
            context.clearRect(0, 0, width, height);
            let pending = false;
            const qualityGroups: typeof cells[] = Array.from({ length: 16 }, () => []);
            cells.forEach((cell, index) => {
                if (cell.order > progress || (exitProgress > 0 && cell.order <= exitProgress)) return;
                if (!spawned.current.has(index)) spawned.current.set(index, now);
                const quality = Math.min(1, Math.max(0, (now - spawned.current.get(index)!) / 250));
                if (quality < 1) pending = true;
                context.imageSmoothingEnabled = false;
                context.drawImage(sampledImage, index % gridColumns, Math.floor(index / gridColumns), 1, 1,
                    cell.x, cell.y, cell.size, cell.size);
                const level = Math.min(15, Math.ceil(quality * 16) - 1);
                if (level >= 0) qualityGroups[level].push(cell);
            });
            qualityGroups.forEach((group, level) => {
                if (!group.length) return;
                context.save();
                context.beginPath();
                group.forEach(cell => context.rect(cell.x, cell.y, cell.size, cell.size));
                context.clip();
                context.globalAlpha = (level + 1) / 16;
                context.imageSmoothingEnabled = true;
                context.drawImage(element, offsetX, offsetY, drawnWidth, drawnHeight);
                context.restore();
            });
            if (progress >= 1 && !pending && !exitProgress) setSettled(true);
            else if (pending) frame = requestAnimationFrame(paint);
        };
        paint(performance.now());
        return () => cancelAnimationFrame(frame);
    }, [animating, progress, exitProgress, loaded, columns, src]);

    return <>
        <img ref={image} className={`cell-reveal-image ${className} ${animating ? 'cell-reveal-loading' : ''} ${hoverReady && visible && loaded && revealFinished && !exiting ? 'cell-reveal-ready' : ''}`}
            src={src} alt={alt} width={width} height={height} loading="eager" decoding="async" draggable={false}
            onLoad={() => setLoadedSrc(src)} onError={() => setFallback(true)} />
        {animating && <canvas ref={canvas} className="cell-reveal-canvas" aria-hidden="true" />}
    </>;
}
