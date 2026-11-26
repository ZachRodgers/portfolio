import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Pause, Play, RotateCcw } from 'lucide-react';
import './OperatorVideo.css';
import DesignRationale from '../mission-control/DesignRationale';

const VIDEO = '/assets/ux_ui/content/portfolio/parallel/video/operator.mp4';
const POSTER = '/assets/ux_ui/content/portfolio/parallel/video/operator.png';
const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${String(remaining).padStart(2, '0')}`;
};

export default function OperatorVideo() {
    const video = useRef<HTMLVideoElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [ready, setReady] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const update = () => setFullscreen(document.fullscreenElement === container.current);
        document.addEventListener('fullscreenchange', update);
        return () => document.removeEventListener('fullscreenchange', update);
    }, []);

    const togglePlayback = () => {
        const player = video.current;
        if (!player) return;
        if (player.paused) void player.play().catch(() => {});
        else player.pause();
    };
    const replay = () => {
        if (!video.current) return;
        video.current.currentTime = 0;
        void video.current.play().catch(() => {});
    };
    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            void document.exitFullscreen().catch(() => {});
            return;
        }
        const element = container.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
        const player = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
        if (element?.requestFullscreen) void element.requestFullscreen().catch(() => {});
        else if (element?.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else player?.webkitEnterFullscreen?.();
    };
    const progress = duration > 0 ? current / duration * 100 : 0;

    return <section className="mission-overview parallel-video-section" aria-label="Parallel Operator demo video">
        <div className="mission-overview-inner parallel-video-inner">
            <div className="demo-video-wrapper">
                <div ref={container} className="demo-video-container"
                    onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
                    {!started && <img src={POSTER} alt="" className="demo-video-thumbnail" aria-hidden="true" onClick={togglePlayback} />}
                    <video ref={video} className="demo-video" preload="metadata" poster={POSTER} playsInline
                        onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
                        onCanPlay={() => { setReady(true); setBuffering(false); }}
                        onWaiting={() => setBuffering(true)}
                        onPlaying={() => setBuffering(false)}
                        onPlay={() => { setPlaying(true); setStarted(true); }}
                        onPause={() => setPlaying(false)}
                        onTimeUpdate={event => setCurrent(event.currentTarget.currentTime)}
                        onClick={togglePlayback}>
                        <source src={VIDEO} type="video/mp4" />
                    </video>
                    {started && buffering && <div className="demo-loading-spinner demo-loading-spinner--overlay" aria-label="Loading video" />}
                    {!playing && <button type="button" className="demo-video-center-btn" onClick={togglePlayback} aria-label="Play video">
                        <Play size={36} fill="currentColor" aria-hidden="true" />
                    </button>}
                    <div className={`demo-video-controls ${hovering || !playing ? 'visible' : ''}`}>
                        <button type="button" className="demo-video-fullscreen-btn" onClick={togglePlayback} aria-label={playing ? 'Pause video' : 'Play video'}>
                            {playing ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button type="button" className="demo-video-fullscreen-btn" onClick={replay} aria-label="Replay video"><RotateCcw size={16} /></button>
                        <input type="range" className="demo-video-scrubber" min={0} max={duration || 0} step={0.01}
                            value={current} onChange={event => { const next = Number(event.target.value); if (video.current) video.current.currentTime = next; setCurrent(next); }}
                            aria-label="Seek video" style={{ '--progress': `${progress}%` } as React.CSSProperties} />
                        <span className="demo-video-time">{formatTime(current)} / {formatTime(duration)}</span>
                        <button type="button" className="demo-video-fullscreen-btn" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                            {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                    {!ready && started && <span className="parallel-video-loading" role="status">Loading video…</span>}
                </div>
            </div>
        </div>
        <DesignRationale project="parallel" page={0} />
    </section>;
}
