import React from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';

const features = [
    {
        title: 'Questions',
        copy: 'Mission Control asks focused questions before work begins, so you can choose the direction and shape the result together.'
    },
    {
        title: 'Preview Canvas',
        copy: 'Build previews, wireframes, and mockups directly in the app. Choose what feels right before implementation starts.'
    },
    {
        title: 'Plans & Todo Lists',
        copy: 'Turn a plan into a working HTML prototype with real components, then follow each task as the work moves forward.'
    }
];

export default function MissionControlPlanning() {
    return <section id="mission-control-planning" className="mission-overview ux-framework-section" aria-label="Questions, previews, and plans">
        <FrameworkRule />
        <div className="mission-overview-inner">
            <MissionDemoFrame
                src="/assets/ux_ui/content/portfolio/mission-control/demo/index.html?scene=planning"
                title="Mission Control planning and preview workflow"
                showPause={false}
                tone="planning"
            />
            <div className="mission-feature-grid">
                {features.map((feature) => <article key={feature.title}>
                    <h3>{feature.title}</h3>
                    <p>{feature.copy}</p>
                </article>)}
            </div>
        </div>
    </section>;
}
