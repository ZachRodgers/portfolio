import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Sun, Moon } from 'lucide-react';

interface MissionDemoFrameProps {
    src: string;
    nativeWidth?: number;
    nativeHeight?: number;
    browserBar?: React.ReactNode;
    scaleMethod?: 'transform' | 'zoom';
    themeControl?: boolean;
    adminPage?: string;
    onAdminPageChange?: (page: string) => void;
    onReplay?: () => void;
    title: string;
    showPause?: boolean;
    showReplay?: boolean;
    tone?: 'default' | 'planning';
    layout?: 'fit' | 'crop';
    onInteraction?: () => void;
    active?: boolean;
    eager?: boolean;
}

export default function MissionDemoFrame({ src, title, showPause = true, showReplay = true, tone = 'default', layout = 'fit', onInteraction, active = true, eager = false, nativeWidth = 1100, nativeHeight = 700, browserBar, scaleMethod = 'transform', themeControl = false, adminPage, onAdminPageChange, onReplay }: MissionDemoFrameProps) {
    const frame = useRef<HTMLIFrameElement>(null);
    const viewport = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(nativeWidth);
    const scale = layout === 'crop' ? 1 : Math.min(1, width / nativeWidth);
    const frameHeight = nativeHeight;
    const browserBarHeight = browserBar ? 48 : 0;
    const viewportHeight = nativeHeight + browserBarHeight;
    const joinOverlap = browserBar && scaleMethod === 'zoom' && layout !== 'crop' ? 1 : 0;
    const frameWidth = layout === 'crop' ? Math.max(nativeWidth, width + 160) : Math.max(nativeWidth, width);
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

    useEffect(() => {
        if (!themeControl) return;
        const receive = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'stockhub-theme' && (event.data.theme === 'dark' || event.data.theme === 'light')) setTheme(event.data.theme);
        };
        window.addEventListener('message', receive);
        return () => window.removeEventListener('message', receive);
    }, [themeControl]);
    useEffect(() => {
        if (!adminPage) return;
        frame.current?.contentWindow?.postMessage({type:'stockhub-admin-set-page', page:adminPage}, window.location.origin);
    }, [adminPage]);
    useEffect(() => {
        if (!onAdminPageChange) return;
        const receive = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'stockhub-admin-page' && typeof event.data.page === 'string') onAdminPageChange(event.data.page);
        };
        window.addEventListener('message', receive);
        return () => window.removeEventListener('message', receive);
    }, [onAdminPageChange]);
    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        frame.current?.contentWindow?.postMessage({ type: 'stockhub-set-theme', theme: next }, window.location.origin);
    };

    return <div onPointerDown={onInteraction} onWheel={onInteraction} onKeyDown={onInteraction} className={`mission-demo-background${tone === 'planning' ? ' mission-demo-background--planning' : ''}${layout === 'crop' ? ' mission-demo-background--crop' : ''}`}>
        <div className="mission-playback">
            {themeControl && <button aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}</button>}
            {showPause && <button aria-label={paused ? 'Play demo' : 'Pause demo'} title={paused ? 'Play' : 'Pause'} onClick={() => { setPaused(value => !value); send('interact'); }}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
            {showReplay && <button aria-label="Replay demo" title="Replay" onClick={() => { onReplay?.(); send('replay'); }}><RotateCcw size={14} /></button>}
        </div>
        <div className={`mission-demo-viewport${layout === 'crop' ? ' mission-demo-viewport--crop' : ''}`} ref={viewport} style={{ height: viewportHeight * scale - joinOverlap }}>
            {browserBar && <div data-theme={themeControl ? theme : undefined} style={{ position: 'absolute', top: 0, left: 0, width: frameWidth, height: browserBarHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{browserBar}</div>}
            <iframe ref={frame} title={title} src={src} loading={eager ? 'eager' : 'lazy'} onLoad={() => { send(); if (adminPage) frame.current?.contentWindow?.postMessage({type:'stockhub-admin-set-page', page:adminPage}, window.location.origin); }} style={{ position: 'absolute', left: layout === 'crop' ? 'auto' : 0, right: layout === 'crop' ? 0 : 'auto', top: scaleMethod === 'zoom' && layout !== 'crop' ? browserBarHeight - joinOverlap / scale : browserBarHeight * scale, margin: 0, width: frameWidth, height: frameHeight, ...(scaleMethod === 'zoom' && layout !== 'crop' ? { zoom: scale } : { transform: layout === 'crop' ? 'none' : `scale(${scale})` }) }} />
        </div>
    </div>;
}
