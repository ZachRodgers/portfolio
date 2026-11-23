import React from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';
import './mission-control.css';

export default function MissionControl() {
    return <section id="project-2" className="mission-overview ux-framework-section" aria-labelledby="mission-title">
        <FrameworkRule />
        <div className="mission-overview-inner">
            <h2 id="mission-title">A coding harness for engineers and designers with skills that need tools to support them.</h2>
            <MissionDemoFrame src="/assets/ux_ui/content/portfolio/mission-control/demo/index.html" title="Interactive Mission Control workspace" />
            <div className="mission-feature-grid">
                <article><h3>Multi-Agent Workflows</h3><p>Run multiple agents in parallel, tackling different parts of the codebase. Follow every conversation without losing sight of the whole project.</p></article>
                <article><h3>Code Staging</h3><p>Give each task its own stage. Keep parallel changes separate, inspect each file, and bring the work together when it’s ready.</p></article>
                <article><h3>Git Control</h3><p>You have the final say. Review, commit, and merge with the control of a traditional IDE, in an interface that keeps the clutter out of your way.</p></article>
            </div>
        </div>
    </section>;
}
