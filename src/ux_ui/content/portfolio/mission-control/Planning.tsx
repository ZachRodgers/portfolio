import React from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';

const features = [
    {
        title: 'Questions',
        copy: 'Answer questions before work begins to help set the direction and make decisions early.'
    },
    {
        title: 'Preview Canvas',
        copy: 'Review interactive previews, wireframes, and mockups alongside the conversation.'
    },
    {
        title: 'Plans & Todo Lists',
        copy: 'Review the plan and its tasks together, then follow progress as the work takes shape.'
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
