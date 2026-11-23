import React from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';
import './mission-control.css';

export default function MissionControl() {
    return <section id="project-2" className="mission-overview ux-framework-section" aria-labelledby="mission-title">
        <FrameworkRule />
        <div className="mission-overview-inner">
            <h2 id="mission-title">A coding workspace for engineers and designers, from first idea to finished code.</h2>
            <MissionDemoFrame src="/assets/ux_ui/content/portfolio/mission-control/demo/index.html" title="Interactive Mission Control workspace" />
            <div className="mission-feature-grid">
                <article><h3>Multi-Agent Workflows</h3><p>Delegate separate features to multiple agents working in parallel. Follow each conversation and keep track of progress across the project.</p></article>
                <article><h3>Code Staging</h3><p>Group changed files into named stages within one working tree. Review each set of changes and commit it independently when it’s ready.</p></article>
                <article><h3>Git Control</h3><p>Review diffs, manage branches, and decide when to commit or merge. Familiar Git controls stay close to the work, without the clutter of a full IDE.</p></article>
            </div>
        </div>
    </section>;
}
