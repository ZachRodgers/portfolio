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
                    <p>Run a site beside the conversation. Browse the page, inspect details, and capture an area to discuss.</p>
                </article>
                <article>
                    <h3>Design Mode</h3>
                    <p>Select elements to adjust spacing and styles, edit text, or leave comments anchored to the page.</p>
                </article>
            </aside>
        </div>
    </section>;
}
