import React from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';

export default function MissionControlBrowserDesign() {
    return <section id="mission-control-browser-design" className="mission-overview ux-framework-section mission-browser-section" aria-label="Browser preview and Design Mode">
        <FrameworkRule />
        <div className="mission-browser-layout">
            <MissionDemoFrame
                src="/assets/ux_ui/content/portfolio/mission-control/demo/index.html?scene=browser-design"
                title="Mission Control browser preview and Design Mode"
                tone="planning"
                layout="crop"
            />
            <aside className="mission-browser-notes">
                <article>
                    <h3>Browser Preview</h3>
                    <p>Run a working site beside the conversation. Mission Control can move through the page, inspect details, and capture the exact area under review.</p>
                </article>
                <article>
                    <h3>Design Mode</h3>
                    <p>Point at the page to explore spacing, adjust elements, and leave anchored comments. Your edits stay visible for review before they are applied to code.</p>
                </article>
            </aside>
        </div>
    </section>;
}
