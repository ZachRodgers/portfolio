import React from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';
import './mission-control.css';

export default function MissionControl() {
    return <section id="project-2" className="mission-overview ux-framework-section" aria-labelledby="mission-title">
        <FrameworkRule />
        <div className="mission-overview-inner">
            <h2 id="mission-title">A workspace for building software, from first idea to finished code.</h2>
            <MissionDemoFrame src="/assets/ux_ui/content/portfolio/mission-control/demo/index.html" title="Interactive Mission Control workspace" />
            <div className="mission-feature-grid">
                <article><h3>Parallel Workflows</h3><p>Run multiple tasks at once and follow each conversation as the work progresses.</p></article>
                <article><h3>Code Staging</h3><p>Give each task its own stage, review the files it changes, and bring the work together when it’s ready.</p></article>
                <article><h3>Git Control</h3><p>Review changes, manage branches, and commit or merge from the same workspace.</p></article>
            </div>
        </div>
    </section>;
}
