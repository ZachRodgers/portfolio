import React from 'react';
import MissionDemoFrame from './MissionDemoFrame';

const features = [
    {
        title: 'Questions',
        copy: 'Questions bring important decisions forward before implementation starts. Compare options, add context, and guide the work without rewriting the brief.'
    },
    {
        title: 'Preview Canvas',
        copy: 'Watch previews, wireframes, and mockups take shape inside the app. Compare directions, leave comments, and make changes alongside the conversation.'
    },
    {
        title: 'Plans & Todo Lists',
        copy: 'Review a visual HTML plan alongside its task list. Working components and a clear sequence make the proposed work easier to assess before it begins.'
    }
];

export default function MissionControlPlanning() {
    return <section id="mission-control-planning" className="mission-overview" aria-label="Questions, previews, and plans">
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
