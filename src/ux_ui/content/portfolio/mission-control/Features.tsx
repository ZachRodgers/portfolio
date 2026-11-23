import React, { useCallback, useEffect, useRef, useState } from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';

const features = [
    { id: 'brand', label: 'Brand Guideline', description: 'Keep a living visual reference alongside your work. Explore the colors, typography, components, and interaction patterns that give Casa Toronto its character.' },
    { id: 'index', label: 'Codebase Index', description: 'Explore the structure of a project in an interactive 3D map. Follow connections between files and modules to find relevant context quickly.' },
    { id: 'git', label: 'Git Editor', description: 'See branches, commits, and changes together. Review and manage the work without leaving the workspace.' },
    { id: 'skills', label: 'Skill Manager', description: 'Browse and manage reusable skills that guide planning, mockups, and wireframes across your projects.' },
];

export default function MissionControlFeatures() {
    const [selected, setSelected] = useState(0);
    const [revision, setRevision] = useState(0);
    const [inView, setInView] = useState(false);
    const section = useRef<HTMLElement>(null);
    const timer = useRef<number>();
    const lastInteraction = useRef(0);
    const arm = useCallback((delay: number) => {
        window.clearTimeout(timer.current);
        if (!inView || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer.current = window.setTimeout(() => setSelected(value => (value + 1) % features.length), delay);
    }, [inView]);
    const interact = useCallback(() => { lastInteraction.current = Date.now(); arm(10000); }, [arm]);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .15 });
        if (section.current) observer.observe(section.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        arm(Math.max(4000, lastInteraction.current + 10000 - Date.now()));
        return () => window.clearTimeout(timer.current);
    }, [arm, selected]);
    useEffect(() => {
        const onVisibility = () => { if (document.hidden) window.clearTimeout(timer.current); else arm(4000); };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [arm]);
    const feature = features[selected];
    return <section ref={section} id="mission-control-features" className="mission-overview ux-framework-section" aria-label="Mission Control features" onPointerDown={interact} onKeyDown={interact} onWheel={interact}>
        <FrameworkRule />
        <div className="mission-overview-inner mission-showcase">
            <div className="mission-showcase-tabs" role="tablist" aria-label="Explore Mission Control features" style={{ '--selected-tab': selected } as React.CSSProperties}>
                <span className="mission-showcase-indicator" aria-hidden="true" />
                {features.map((item, index) => <button key={item.id} role="tab" aria-selected={selected === index} aria-controls="mission-feature-panel" onClick={() => { interact(); setSelected(index); setRevision(value => value + 1); }}>{item.label}</button>)}
            </div>
            <div id="mission-feature-panel" role="tabpanel" className="mission-showcase-description"><p>{feature.description}</p></div>
            <MissionDemoFrame key={`${feature.id}-${revision}`} src={`/assets/ux_ui/content/portfolio/mission-control/demo/index.html?scene=feature-${feature.id}`} title={`Mission Control ${feature.label}`} tone="planning" showPause={feature.id === 'index'} showReplay={false} onInteraction={interact} />
        </div>
    </section>;
}
