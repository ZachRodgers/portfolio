import React, { useEffect, useRef, useState } from 'react';

export function squareCells(width: number, height: number) {
    const size = width / 8;
    const rows = Math.ceil(height / size);
    return Array.from({ length: rows * 8 }, (_, index) => {
        const row = Math.floor(index / 8);
        const random = ((index * 73 + 19) % 101) / 101;
        return { x: (index % 8) * size, y: row * size, size, order: (row + random * 3) / (rows + 2) };
    });
}

export default function CellRevealImage({ src, visible, revealProgress, exitProgress = 0 }: {
    src: string; visible: boolean; revealProgress?: number; exitProgress?: number;
}) {
    const image = useRef<HTMLImageElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [localProgress, setLocalProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [fallback, setFallback] = useState(false);
    const progress = revealProgress ?? localProgress;
    const animating = visible && !fallback && (progress < 1 || exitProgress > 0);

    useEffect(() => {
        if (!visible) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setFallback(true);
            return;
        }
        if (revealProgress !== undefined) return;
        let frame = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const value = Math.min(1, (now - start) / 250);
            setLocalProgress(value);
            if (value < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [visible, revealProgress]);

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
        for (const cell of squareCells(width, height)) {
            if (cell.order <= progress && (exitProgress === 0 || cell.order > exitProgress)) {
                context.rect(cell.x, cell.y, cell.size, cell.size);
            }
        }
        context.clip();
        context.drawImage(element, (width - drawnWidth) / 2, (height - drawnHeight) * positionY, drawnWidth, drawnHeight);
        context.restore();
    }, [animating, progress, exitProgress, loaded]);

    return <>
        <img ref={image} className={`ux-contents-art ${animating ? 'is-cell-loading' : ''}`}
            src={src} alt="" width="900" height="1500" loading="eager" decoding="async" draggable={false}
            onLoad={() => setLoaded(true)} onError={() => setFallback(true)} />
        {animating && <canvas ref={canvas} className="ux-cell-reveal" aria-hidden="true" />}
    </>;
}
