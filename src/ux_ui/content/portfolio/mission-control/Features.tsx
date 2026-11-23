import React, { useCallback, useEffect, useRef, useState } from 'react';
import FrameworkRule from '../../../sections/FrameworkRule';
import MissionDemoFrame from './MissionDemoFrame';

const features = [
    { id: 'brand', label: 'Brand Guideline', description: 'A source-backed guide brings the project’s colors, type, and components together. It updates as the project changes, giving future work a consistent reference.' },
    { id: 'index', label: 'Codebase Index', description: 'A local index maps the codebase and points agents to relevant files and symbols. Less searching and fewer broad reads help save time and context.' },
    { id: 'git', label: 'Git Editor', description: 'Inspect commit history, compare branches, and review file diffs in one place. Manage the repository with familiar Git controls, without switching to a terminal.' },
    { id: 'skills', label: 'Skill Manager', description: 'Create and manage skills that turn repeatable processes into workflows. Give agents instructions for using the canvas, browser, and other app capabilities.' },
];

export default function MissionControlFeatures() {
    const [selected, setSelected] = useState(0);
    const [revisions, setRevisions] = useState([0, 0, 0, 0]);
    const [prepared, setPrepared] = useState(false);
    const [inView, setInView] = useState(false);
    const section = useRef<HTMLElement>(null);
    const timer = useRef<number>();
    const lastInteraction = useRef(0);
    const previous = useRef(0);
    const arm = useCallback((delay: number) => {
        window.clearTimeout(timer.current);
        if (!inView || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer.current = window.setTimeout(() => setSelected(value => (value + 1) % features.length), delay);
    }, [inView]);
    const interact = useCallback(() => { lastInteraction.current = Date.now(); arm(10000); }, [arm]);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => { setInView(entry.isIntersecting); if (entry.isIntersecting) setPrepared(true); }, { threshold: .15 });
        if (section.current) observer.observe(section.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (previous.current === selected) return;
        const leaving = previous.current;
        previous.current = selected;
        setRevisions(values => values.map((value, index) => index === leaving ? value + 1 : value));
    }, [selected]);
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
    return <section ref={section} id="mission-control-features" data-feature={feature.id} className="mission-overview ux-framework-section" aria-label="Mission Control features" onPointerDown={interact} onKeyDown={interact} onWheel={interact}>
        <FrameworkRule />
        <div className="mission-overview-inner mission-showcase">
            <div className="mission-showcase-tabs" role="tablist" aria-label="Explore Mission Control features" style={{ '--selected-tab': selected } as React.CSSProperties}>
                <span className="mission-showcase-indicator" aria-hidden="true" />
                {features.map((item, index) => <button key={item.id} role="tab" aria-selected={selected === index} aria-controls="mission-feature-panel" onClick={() => { interact(); setSelected(index); }}>{item.label}</button>)}
            </div>
            <div id="mission-feature-panel" role="tabpanel" className="mission-showcase-description"><p>{feature.description}</p></div>
            {prepared && <div className="mission-showcase-frames">{features.map((item, index) => <div key={item.id} className="mission-showcase-frame" data-active={selected === index} aria-hidden={selected !== index}>
                <MissionDemoFrame key={`${item.id}-${revisions[index]}`} src={`/assets/ux_ui/content/portfolio/mission-control/demo/index.html?scene=feature-${item.id}`} title={`Mission Control ${item.label}`} tone="planning" showPause={item.id === 'index'} showReplay={false} onInteraction={interact} active={selected === index && inView} eager />
            </div>)}</div>}
        </div>
    </section>;
}
