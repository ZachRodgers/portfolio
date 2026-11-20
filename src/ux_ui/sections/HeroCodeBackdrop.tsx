import React from 'react';
import './HeroCodeBackdrop.css';

const snippets = [
    { start: 0, position: 'left', lines: ['> read src/interface.tsx', '  export function Interface() {', '    return <Experience />;', '  }'] },
    { start: .65, position: 'right', lines: ['> apply_patch', '  + const flow = compose({', '  +   intent, context, craft', '  + });', '  + await flow.validate();', '  + render(flow.result);', '  patch applied'] },
    { start: 1.7, position: 'bottom', lines: ['> run checks', '  types ........ passed', '  tests ........ passed', '  build ........ complete', '> inspect output', '  preview ready', '> ready'] },
];

export default function HeroCodeBackdrop({ time, active }: { time: number; active: boolean }) {
    if (!active || time < 6.75 || time >= 12.3) return null;
    const elapsed = time - 6.75;
    const glitch = time >= 11.3;
    const burst = Math.floor((time - 11.3) * 8);
    return <div className="ux-code-backdrop" aria-hidden="true">
        {snippets.map(snippet => {
            const age = Math.max(0, elapsed - snippet.start);
            const text = snippet.lines.join('\n');
            const count = Math.min(text.length, Math.floor(age * 58));
            return <pre key={snippet.position} className={`ux-code-fragment ux-code-fragment--${snippet.position}`}
                style={{ opacity: Math.min(1, age / .4) * (glitch && burst % 3 === 1 ? .15 : 1) }}>
                {text.slice(0, count)}{count > 0 && count < text.length && <span className="ux-code-cursor">▍</span>}
            </pre>;
        })}
        {glitch && Array.from({ length: 9 }, (_, index) => {
            const text = snippets[index % snippets.length].lines.join('\n');
            const visible = (burst * 7 + index * 3) % 5 < 3;
            return <pre key={`burst-${index}`} className="ux-code-fragment ux-code-fragment--burst" style={{
                left: `${5 + (index * 31 + burst * 3) % 79}%`,
                top: `${8 + (index * 23) % 76}%`,
                opacity: visible ? .8 : 0,
                transform: `translateX(${(burst + index) % 2 ? -12 : 12}px)`,
            }}>{text.slice((index * 13 + burst * 7) % 40, 145)}</pre>;
        })}
    </div>;
}
