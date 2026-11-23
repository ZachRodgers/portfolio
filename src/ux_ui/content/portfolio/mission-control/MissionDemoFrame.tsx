import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface MissionDemoFrameProps {
    src: string;
    title: string;
}

export default function MissionDemoFrame({ src, title }: MissionDemoFrameProps) {
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

    return <div className="mission-demo-background">
        <div className="mission-playback">
            <button aria-label={paused ? 'Play demo' : 'Pause demo'} title={paused ? 'Play' : 'Pause'} onClick={() => { setPaused(value => !value); send('interact'); }}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
            <button aria-label="Replay demo" title="Replay" onClick={() => send('replay')}><RotateCcw size={14} /></button>
        </div>
        <div className="mission-demo-viewport" ref={viewport} style={{ height: 700 * scale }}>
            <iframe ref={frame} title={title} src={src} loading="lazy" onLoad={() => send()} style={{ width: Math.max(1100, width), height: 700, transform: `scale(${scale})` }} />
        </div>
    </div>;
}
