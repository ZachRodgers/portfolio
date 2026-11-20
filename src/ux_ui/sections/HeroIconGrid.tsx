import React, { useLayoutEffect, useRef } from 'react';
import {
    Wrench, Phone, BookHeadphones, BrickWallShield, FileText, GlobeLock,
    WholeWord, GitBranch, CodeXml, FolderGit2, GitCommitHorizontal,
    GitCompareArrows, SquareTerminal, Paintbrush, Layers, Frame,
    SplinePointer, Grid3x2, EyeOff, Tangent, LassoSelect, WandSparkles,
    PenTool, Pointer, VectorSquare,
} from 'lucide-react';
import './HeroIconGrid.css';

const engineering = [Wrench, Phone, BookHeadphones, BrickWallShield, FileText,
    GlobeLock, WholeWord, GitBranch, CodeXml, FolderGit2, GitCommitHorizontal,
    GitCompareArrows, SquareTerminal];
const design = [Paintbrush, Layers, Frame, SplinePointer, Grid3x2, EyeOff,
    VectorSquare, Tangent, LassoSelect, WandSparkles, PenTool, Pointer];
// Ten columns, with an empty central area for the orb and caption.
const cells = [11, 28, 41, 8, 21, 48, 1, 38, 10, 49, 18, 31, 0];
const clamp = (value: number) => Math.max(0, Math.min(1, value));

// Uneven arrivals and independent lifetimes keep the field from moving in waves.
const appearances = [
    { start: .08, life: 1.8, icon: engineering[0] },
    { start: .43, life: 1.45, icon: engineering[8] },
    { start: .82, life: 1.95, icon: engineering[2] },
    { start: 1.38, life: 1.65, icon: engineering[7] },
    { start: 1.96, life: 1.6, icon: engineering[3] },
    { start: 2.34, life: 1.85, icon: engineering[12] },
    { start: 3.16, life: 1.65, icon: design[0] },
    { start: 3.61, life: 1.9, icon: design[3] },
    { start: 4.23, life: 1.5, icon: design[4] },
    { start: 4.58, life: 1.85, icon: design[10] },
    { start: 5.13, life: 1.6, icon: design[8] },
    { start: 5.78, life: 1.45, icon: design[9] },
];

export default function HeroIconGrid({ time, active }: { time: number; active: boolean }) {
    const root = useRef<HTMLDivElement>(null);
    const glitch = active && time >= 11.3 && time < 12.3;
    const burst = Math.floor((time - 11.3) * 8);

    useLayoutEffect(() => {
        root.current?.querySelectorAll('path, circle, rect, line, polyline, polygon, ellipse')
            .forEach(shape => shape.setAttribute('pathLength', '1'));
    }, []);

    return <div ref={root} className="ux-icon-grid" aria-hidden="true">
        {appearances.map(({ start, life, icon: Icon }, index) => {
            const age = time - start;
            const draw = clamp(age / .6);
            const erase = clamp((age - (life - .6)) / .6);
            const opacity = active ? clamp(age / .35) * (1 - erase) : 0;
            const cell = cells[index];
            return <span key={index} className="ux-icon-grid-cell" style={{
                gridColumn: cell % 10 + 1,
                gridRow: Math.floor(cell / 10) + 1,
                opacity,
                '--icon-trace': 1 - draw - erase,
            } as React.CSSProperties}>
                <Icon size={36} strokeWidth={1} />
            </span>;
        })}
        {glitch && [...engineering, ...design].map((Icon, index) => <span
            key={`burst-${index}`} className="ux-icon-grid-cell ux-icon-grid-burst" style={{
                gridColumn: (index * 7) % 10 + 1,
                gridRow: Math.floor(index / 5) + 1,
                opacity: (burst * 3 + index * 7) % 5 < 3 ? 1 : 0,
                transform: `translate(${(burst + index) % 3 * 5 - 5}px, ${(burst * index) % 3 * 4 - 4}px)`,
            }}><Icon size={36} strokeWidth={1} /></span>)}
    </div>;
}
