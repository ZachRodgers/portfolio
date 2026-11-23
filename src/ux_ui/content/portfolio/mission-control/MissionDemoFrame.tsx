import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface MissionDemoFrameProps {
    src: string;
    title: string;
    showPause?: boolean;
    showReplay?: boolean;
    tone?: 'default' | 'planning';
    layout?: 'fit' | 'crop';
    onInteraction?: () => void;
    active?: boolean;
    eager?: boolean;
}

export default function MissionDemoFrame({ src, title, showPause = true, showReplay = true, tone = 'default', layout = 'fit', onInteraction, active = true, eager = false }: MissionDemoFrameProps) {
    const frame = useRef<HTMLIFrameElement>(null);
    const viewport = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(1100);
    const scale = layout === 'crop' ? 1 : Math.min(1, width / 1100);
    const frameHeight = 700;
    const viewportHeight = 700;
    const frameWidth = layout === 'crop' ? Math.max(1100, width + 160) : Math.max(1100, width);
    const send = (action?: string) => frame.current?.contentWindow?.postMessage({ type: 'mc-demo', action, paused, visible: visible && active, frameWidth }, window.location.origin);

    useLayoutEffect(() => {
        const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
        if (viewport.current) { resize.observe(viewport.current); observer.observe(viewport.current); }
        return () => { resize.disconnect(); observer.disconnect(); };
    }, []);
    useEffect(() => {
        const notify = () => frame.current?.contentWindow?.postMessage({ type: 'mc-demo', paused, visible: visible && active, frameWidth }, window.location.origin);
        notify();
        const ready = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'mc-demo-ready') notify();
        };
        window.addEventListener('message', ready);
        return () => window.removeEventListener('message', ready);
    }, [paused, visible, active, frameWidth]);
    useEffect(() => {
        if (!onInteraction) return;
        const receive = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'mc-showcase-interaction') onInteraction();
        };
        window.addEventListener('message', receive);
        return () => window.removeEventListener('message', receive);
    }, [onInteraction]);

    return <div onPointerDown={onInteraction} onWheel={onInteraction} onKeyDown={onInteraction} className={`mission-demo-background${tone === 'planning' ? ' mission-demo-background--planning' : ''}${layout === 'crop' ? ' mission-demo-background--crop' : ''}`}>
        <div className="mission-playback">
            {showPause && <button aria-label={paused ? 'Play demo' : 'Pause demo'} title={paused ? 'Play' : 'Pause'} onClick={() => { setPaused(value => !value); send('interact'); }}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
            {showReplay && <button aria-label="Replay demo" title="Replay" onClick={() => send('replay')}><RotateCcw size={14} /></button>}
        </div>
        <div className={`mission-demo-viewport${layout === 'crop' ? ' mission-demo-viewport--crop' : ''}`} ref={viewport} style={{ height: viewportHeight * scale }}>
            <iframe ref={frame} title={title} src={src} loading={eager ? 'eager' : 'lazy'} onLoad={() => send()} style={{ position: 'absolute', left: layout === 'crop' ? 'auto' : 0, right: layout === 'crop' ? 0 : 'auto', top: 0, margin: 0, width: frameWidth, height: frameHeight, transform: layout === 'crop' ? 'none' : `scale(${scale})` }} />
        </div>
    </div>;
}
