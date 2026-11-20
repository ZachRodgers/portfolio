import React from 'react';
import content from '../content/page.json';
import './Contents.css';

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
const logos = ['parallel', 'mission_control', 'stockhub'];
export function contentsImages(time: number) {
    return contentsCues.filter(cue => time >= cue.start && time < cue.end).map(cue => cue.image);
}

const Contents: React.FC<{ time: number }> = ({ time }) => (
    <nav id="contents" className={`ux-contents ${time >= contentsEnd ? 'has-logos' : ''}`} aria-label="Portfolio contents">
        {contentsCues.map(cue => {
            const visible = time >= cue.start && time < cue.end;
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
                    <img className="ux-contents-art" src={`/assets/ux_ui/hero/${cue.image}.png`} alt="" width="900" height="1500"
                        loading="eager" decoding="async" draggable={false} />
                    {final && <span className="ux-contents-brand" aria-hidden="true">
                        <img src={`/assets/ux_ui/hero/${logos[cue.column]}.png`} alt="" loading="eager" decoding="async" draggable={false} />
                    </span>}
                </a>
            );
        })}
    </nav>
);

export default Contents;
