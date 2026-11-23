import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import FrameworkRule from '../../../sections/FrameworkRule';
import './mission-control.css';

export default function MissionControl() {
    const frame = useRef<HTMLIFrameElement>(null);
    const viewport = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(1100);
    const scale = Math.min(1, width / 1100);
    const send = (action?: string) => frame.current?.contentWindow?.postMessage({ type: 'mc-demo', action, paused, visible }, window.location.origin);

    useEffect(() => {
        const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
        if (viewport.current) { resize.observe(viewport.current); observer.observe(viewport.current); }
        return () => { resize.disconnect(); observer.disconnect(); };
    }, []);
    useEffect(() => {
        const notify = () => frame.current?.contentWindow?.postMessage({ type: 'mc-demo', paused, visible }, window.location.origin);
        notify();
        const ready = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'mc-demo-ready') notify();
        };
        window.addEventListener('message', ready);
        return () => window.removeEventListener('message', ready);
    }, [paused, visible]);

    return <section id="project-2" className="mission-overview ux-framework-section" aria-labelledby="mission-title">
        <FrameworkRule />
        <div className="mission-overview-inner">
            <h2 id="mission-title">A coding harness for engineers and designers with skills that need tools to support them.</h2>
            <div className="mission-demo-background">
                <div className="mission-playback">
                    <button aria-label={paused ? 'Play demo' : 'Pause demo'} title={paused ? 'Play' : 'Pause'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
                    <button aria-label="Replay demo" title="Replay" onClick={() => send('replay')}><RotateCcw size={14} /></button>
                </div>
                <div className="mission-demo-viewport" ref={viewport} style={{ height: 700 * scale }}>
                    <iframe ref={frame} title="Interactive Mission Control workspace" src="/assets/ux_ui/content/portfolio/mission-control/demo/index.html" loading="lazy"
                        onLoad={() => send()} style={{ width: Math.max(1100, width), height: 700, transform: `scale(${scale})` }} />
                </div>
            </div>
            <div className="mission-feature-grid">
                <article><h3>Multi-Agent Workflows</h3><p>Run multiple agents in parallel, tackling different parts of the codebase. Follow every conversation without losing sight of the whole project.</p></article>
                <article><h3>Code Staging</h3><p>Give each task its own stage. Keep parallel changes separate, inspect each file, and bring the work together when it’s ready.</p></article>
                <article><h3>Git Control</h3><p>You have the final say. Review, commit, and merge with the control of a traditional IDE, in an interface that keeps the clutter out of your way.</p></article>
            </div>
        </div>
    </section>;
}
