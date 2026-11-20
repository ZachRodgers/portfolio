import React, { useEffect, useRef, useState } from 'react';
import './CellRevealImage.css';

export function squareCells(width: number, height: number, columns = 8) {
    columns = Math.max(1, Math.floor(columns));
    const size = width / columns;
    const rows = Math.ceil(height / size);
    return Array.from({ length: rows * columns }, (_, index) => {
        const row = Math.floor(index / columns);
        const random = ((index * 73 + 19) % 101) / 101;
        return { x: (index % columns) * size, y: row * size, size, order: (row + random * 3) / (rows + 2) };
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
    const progress = revealProgress ?? localProgress;
    const revealFinished = progress >= 1 || fallback;
    const exiting = exitProgress > 0;
    const animating = visible && !fallback && (progress < 1 || exitProgress > 0);

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
        context.save();
        context.beginPath();
        for (const cell of squareCells(width, height, columns)) {
            if (cell.order <= progress && (exitProgress === 0 || cell.order > exitProgress)) {
                context.rect(cell.x, cell.y, cell.size, cell.size);
            }
        }
        context.clip();
        context.drawImage(element, (width - drawnWidth) / 2, (height - drawnHeight) * positionY, drawnWidth, drawnHeight);
        context.restore();
    }, [animating, progress, exitProgress, loaded, columns, src]);

    return <>
        <img ref={image} className={`cell-reveal-image ${className} ${animating ? 'cell-reveal-loading' : ''} ${hoverReady && visible && loaded && revealFinished && !exiting ? 'cell-reveal-ready' : ''}`}
            src={src} alt={alt} width={width} height={height} loading="eager" decoding="async" draggable={false}
            onLoad={() => setLoadedSrc(src)} onError={() => setFallback(true)} />
        {animating && <canvas ref={canvas} className="cell-reveal-canvas" aria-hidden="true" />}
    </>;
}
