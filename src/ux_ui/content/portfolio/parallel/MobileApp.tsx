import React, { useState, useRef, useEffect } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import DesignRationale from '../mission-control/DesignRationale';
import './MobileApp.css';

const slides = ['Map', 'Paid', 'Alert'];

export default function MobileApp() {
    const [active, setActive] = useState('Map');
    const [creditsOpen, setCreditsOpen] = useState(false);
    const device = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.75);
    useEffect(() => { const element = device.current; if (!element) return; const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width * .92 / 393)); observer.observe(element); return () => observer.disconnect(); }, []);
    const frame = useRef<HTMLIFrameElement>(null);
    const selectFeature = (feature: string) => { setActive(feature); frame.current?.contentWindow?.postMessage({ mobileFeature: feature }, window.location.origin); };
    return <section id="parallel-mobile" className="parallel-mobile-app" aria-label="Parallel mobile app">
        <div className="parallel-mobile-layout">
            <div className="parallel-mobile-phone"><div className="mission-playback"><button type="button" aria-label="Replay demo" title="Replay" onClick={() => { setActive('Map'); if (frame.current) frame.current.src = frame.current.src; }}><RotateCcw size={14} /></button></div><div ref={device} className="parallel-mobile-device"><div className="parallel-mobile-screen"><iframe ref={frame} style={{ width: 393, height: 860, transform: `scale(${scale})`, transformOrigin: 'top left' }} title="Interactive Parallel mobile app" src="/assets/ux_ui/content/portfolio/parallel/mobile/demo/index.html" loading="lazy" allow="geolocation 'none'" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" onLoad={() => selectFeature(active)} /></div><img src="/assets/ux_ui/content/portfolio/parallel/mobile/phone_border.png" alt="" /></div><div className="mission-playback parallel-mobile-info" onKeyDown={event => { if (event.key === 'Escape') { setCreditsOpen(false); (event.currentTarget.querySelector('button') as HTMLButtonElement | null)?.focus(); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCreditsOpen(false); }}><button type="button" aria-label="Map credits" aria-expanded={creditsOpen} aria-controls="parallel-map-credits" onClick={() => setCreditsOpen(open => !open)}><Info size={14} /></button><div id="parallel-map-credits" className={`parallel-map-credits${creditsOpen ? ' is-open' : ''}`}><span>Maps © </span><a href="https://www.thunderforest.com/" target="_blank" rel="noreferrer">Thunderforest</a><span> · Data © </span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></div></div></div>
            <div className="parallel-mobile-content">
                <div className="mission-showcase-tabs parallel-mobile-slider" role="tablist" aria-label="Explore app features" style={{ '--selected-tab': slides.indexOf(active) } as React.CSSProperties}>
                    <span className="mission-showcase-indicator" aria-hidden="true" />
                    {slides.map(slide => <button key={slide} role="tab" aria-selected={active === slide} onClick={() => selectFeature(slide)}>{slide}</button>)}
                </div>
                <p>Cameras check you in when you arrive. When you leave, Parallel handles the rest.</p>
                <p>You have 48 hours to pay, and reminders help you keep track. Turn on autopay if you’d rather not think about it. Unpaid plates may be flagged across Parallel lots.</p>
                <p>A blue check confirms your payment, and updates appear in real time.</p>
                <div className="parallel-mobile-downloads">
                    <a href="https://apps.apple.com/" aria-label="Download on the App Store"><img src="/assets/parallel_app_ios_download.svg" alt="Download on the App Store" /></a>
                    <a href="https://play.google.com/store" aria-label="Get it on Google Play"><img src="/assets/parallel_app_android_download.svg" alt="Get it on Google Play" /></a>
                    <a href="#parallel-mobile" onClick={() => {selectFeature('Map'); frame.current?.focus();}} aria-label="Try Parallel on the web"><img src="/assets/parallel_app_web.svg" alt="Parallel web app" /></a>
                    <DesignRationale project="parallel" page={3} />
                </div>
            </div>
        </div>
    </section>;
}
