import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import VoiceOrb from '../../shared/voice-orb/components/VoiceOrb';
import './Hero.css';

const params = { speed: 2.8, warp: 1.5, sphere: 1.5, detail: 1.9, grain: 0.17, pulse: 0.57, highlight: 0.33, exposure: 0, saturation: 1.04, fluid: 0.21 };
export function introText(time: number) {
    const type = (text: string, start: number) => text.slice(0, Math.floor(Math.max(0, Math.min(1, (time - start) / .75)) * text.length));
    const erase = (text: string, end: number) => text.slice(0, Math.ceil(Math.max(0, Math.min(1, (end - time) / .25)) * text.length));
    if (time < 2.89) return type('First there was engineering...', 0);
    if (time < 3.14) return erase('First there was engineering...', 3.14);
    if (time < 6) return type('Then there was design', 3.14);
    if (time < 6.25) return erase('Then there was design', 6.25);
    if (time < 9.11) return type('The world changed with', 6.25);
    return 'The world changed with' + type(' AI', 9.11);
}

const Hero: React.FC<{ audioElement: HTMLAudioElement; failed: boolean }> = ({ audioElement, failed }) => {
    const audio = useRef(audioElement);
    const orb = useRef<HTMLDivElement>(null);
    const graph = useRef<{ context: AudioContext; analyser: AnalyserNode }>();
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [muted, setMuted] = useState(false);
    const [awaitingInteraction, setAwaitingInteraction] = useState(false);

    const start = async () => {
        const element = audio.current;
        element.muted = false;
        setMuted(false);
        try {
            await element.play();
        } catch {
            element.muted = true;
            setMuted(true);
            setAwaitingInteraction(true);
            try {
                await element.play();
            } catch {
                return;
            }
        }
        setPlaying(true);

        // Audio analysis is optional; playback must continue even if it is unavailable.
        try {
            if (!element.muted && !graph.current) {
                const context = new AudioContext();
                if (context.state === 'running') {
                    const analyser = context.createAnalyser();
                    analyser.fftSize = 256;
                    context.createMediaElementSource(element).connect(analyser);
                    analyser.connect(context.destination);
                    graph.current = { context, analyser };
                } else {
                    void context.close();
                }
            }
        } catch {
            // The soundtrack can play without audio analysis.
        }
    };

    const toggleSound = () => {
        setAwaitingInteraction(false);
        const element = audio.current;
        const next = !element.muted;
        element.muted = next;
        setMuted(next);
        if (!next && element.paused && !element.ended) {
            void element.play().then(() => setPlaying(true)).catch(() => {
                element.muted = true;
                setMuted(true);
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setReady(true), 500);
        return () => {
            clearTimeout(timer);
            audio.current.pause();
            void graph.current?.context.close();
            graph.current = undefined;
        };
    }, []);

    useEffect(() => {
        if (ready && !failed) void start();
    }, [ready, failed]);

    useEffect(() => {
        if (!awaitingInteraction) return;
        const unlock = (event: Event) => {
            if (event.target instanceof Element && event.target.closest('.ux-sound')) return;
            const element = audio.current;
            if (element.ended) {
                setAwaitingInteraction(false);
                return;
            }
            element.muted = false;
            setMuted(false);
            void element.play().then(() => {
                setPlaying(true);
                setAwaitingInteraction(false);
            }).catch(() => {
                element.muted = true;
                setMuted(true);
            });
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, [awaitingInteraction]);

    useEffect(() => {
        if (!playing) return;
        let frame: number;
        const samples = new Uint8Array(128);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const tick = () => {
            const current = audio.current?.currentTime || 0;
            setTime(current);
            if (graph.current && orb.current && !reduced) {
                graph.current.analyser.getByteFrequencyData(samples);
                const bass = samples.slice(0, 12).reduce((sum, value) => sum + value, 0) / (12 * 255);
                orb.current.style.transform = `scale(${1 + bass * .035})`;
            }
            if (current >= 10.6) {
                return;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [playing]);

    return (
        <section id="hero" className="ux-hero" aria-label="Engineering, design, and AI">
            <div className={`ux-intro ${ready ? 'is-ready' : ''} ${time >= 10.1 ? 'is-complete' : ''}`}>
                {time < 10.6 && <><div ref={orb} className="ux-orb"><VoiceOrb palette="midnight" variant="painted" state="ready" params={params} size="clamp(200px, 30vw, 350px)" /></div>
                <p className="ux-intro-text" aria-hidden="true">{introText(time)}</p></>}
            </div>
            <span className="ux-sr-only">First there was engineering. Then there was design. The world changed with AI.</span>
            {failed && <p className="ux-intro-start">The soundtrack could not load. Please reload to try again.</p>}
            {ready && !failed && <button className="ux-sound" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}>{muted ? <VolumeX size={22} /> : <Volume2 size={22} />}</button>}
        </section>
    );
};
export default Hero;
