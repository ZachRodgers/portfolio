import React from 'react';
import './FrameOutline.css';

export default function FrameOutline({ progress, animate = false, durationMs = 240, className = '', style }: {
    progress: number; animate?: boolean; durationMs?: number; className?: string; style?: React.CSSProperties;
}) {
    const phase = (start: number, duration: number) => 1 - Math.max(0, Math.min(1, (progress - start) / duration));
    return (
        <svg className={`frame-outline ${className} ${animate ? 'is-tracing' : ''}`} style={{ ...style, '--frame-trace-duration': `${durationMs}ms` } as React.CSSProperties}
            viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className="frame-outline-top" d="M 1 1 H 999" pathLength="1" style={{ strokeDashoffset: phase(0, .3) }} />
            <path className="frame-outline-side" d="M 1 1 V 999" pathLength="1" style={{ strokeDashoffset: phase(.3, .4) }} />
            <path className="frame-outline-side" d="M 999 1 V 999" pathLength="1" style={{ strokeDashoffset: phase(.3, .4) }} />
            <path className="frame-outline-bottom" d="M 1 999 H 500" pathLength="1" style={{ strokeDashoffset: phase(.7, .3) }} />
            <path className="frame-outline-bottom" d="M 999 999 H 500" pathLength="1" style={{ strokeDashoffset: phase(.7, .3) }} />
        </svg>
    );
}

