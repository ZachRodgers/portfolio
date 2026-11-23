import React from 'react';
import MissionDemoFrame from './MissionDemoFrame';

export default function MissionControlBrowserDesign() {
    return <section id="mission-control-browser-design" className="mission-overview mission-browser-section" aria-label="Browser preview and Design Mode">
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
                    <p>Run the site beside the conversation and see the work in context. Browse it together, inspect details, and capture an area when a screenshot says more than a description.</p>
                </article>
                <article>
                    <h3>Design Mode</h3>
                    <p>Give designers a hands-on way to refine the result. Adjust spacing and styles, edit text, or pin a comment to the exact element that needs attention.</p>
                </article>
            </aside>
        </div>
    </section>;
}
