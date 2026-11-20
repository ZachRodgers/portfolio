import React from 'react';
import content from '../content/page.json';
import './Contents.css';
import CellRevealImage from '../../shared/components/CellRevealImage';
import FrameOutline from '../../shared/components/FrameOutline';

// Timecodes use seconds and frames on a 48 fps timeline.
export const contentsCues = [
    { image: 1, column: 0, start: 19 + 22 / 48, end: 20 + 11 / 48 },
    { image: 2, column: 1, start: 20 + 11 / 48, end: 21 + 1 / 48 },
    { image: 3, column: 2, start: 21 + 1 / 48, end: 21 + 38 / 48 },
    { image: 4, column: 0, start: 21 + 38 / 48, end: Infinity },
    { image: 5, column: 1, start: 22 + 6 / 48, end: Infinity },
    { image: 6, column: 2, start: 22 + 22 / 48, end: Infinity },
];
export const contentsEnd = 22 + 43 / 48;
export const traceDuration = .48;
const revealDuration = .45;
const revealLead = traceDuration * .7;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const logos = ['parallel', 'mission_control', 'stockhub'];
export function contentsImages(time: number) {
    return contentsCues.filter(cue => time >= cue.start && time < cue.end).map(cue => cue.image);
}

const Contents: React.FC<{ time: number; revealCount?: number }> = ({ time, revealCount }) => (
    <nav id="contents" className={`ux-contents ${time >= contentsEnd ? 'has-logos' : ''} ${revealCount !== undefined ? 'is-skipped' : ''}`} aria-label="Portfolio contents">
        {contentsCues.map(cue => {
            const visible = time >= cue.start - revealLead && time < cue.end && (revealCount === undefined || (cue.image >= 4 && cue.column < revealCount));
            const project = content.footerProjects[cue.column];
            const final = cue.image >= 4;
            return (
                <a key={cue.image}
                    className={`ux-contents-tile ${visible ? 'is-visible' : ''} ${final ? 'is-final' : ''}`}
                    style={{ gridColumn: cue.column + 1 }}
                    href={`#${project.id}`}
                    aria-label={project.name}
                    aria-hidden={!visible || !final}
                    tabIndex={visible && final ? 0 : -1}>
                    <CellRevealImage className="ux-contents-art" width={900} height={1500} src={`/assets/ux_ui/hero/${cue.image}.png`} visible={visible} durationMs={revealDuration * 1000}
                        revealProgress={revealCount === undefined ? clamp((time - cue.start + revealLead) / revealDuration) : undefined}
                        exitProgress={revealCount === undefined && Number.isFinite(cue.end) ? clamp((time - cue.end + .25) / .25) : 0} />
                    {final && <span className={`ux-contents-brand ux-contents-brand--${logos[cue.column]}`} aria-hidden="true">
                        <img src={`/assets/ux_ui/hero/${logos[cue.column]}.png`} alt="" loading="eager" decoding="async" draggable={false} />
                    </span>}
                </a>
            );
        })}
        {contentsCues.map(cue => {
            const skipped = revealCount !== undefined;
            const tracing = skipped
                ? cue.image >= 4 && cue.column === revealCount
                : time >= cue.start - traceDuration && time < cue.start;
            return tracing ? <FrameOutline key={cue.image} className="ux-frame-outline" style={{ gridColumn: cue.column + 1 }}
                progress={skipped ? 0 : (time - (cue.start - traceDuration)) / traceDuration} animate={skipped} durationMs={traceDuration * 1000} /> : null;
        })}
    </nav>
);

export default Contents;
