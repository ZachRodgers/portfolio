import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import VoiceOrb from '../../shared/voice-orb/components/VoiceOrb';
import type { LevelSource } from '../../shared/voice-orb/lib/orb/audio';
import './Hero.css';

const waitingPalette: [string, string, string, string] = ['#101010', '#121019', '#201948', '#362a80'];
const params = { speed: 2.8, warp: 1.5, sphere: 1.5, detail: 1.9, grain: 0.17, pulse: 0.57, highlight: 0.33, exposure: 0, saturation: 1.04, fluid: 0.21 };
const waitingParams = { ...params, speed: 1.1, warp: 1.1, detail: 1.4, grain: .09 };
const introCues = [
    { text: 'First there was engineering...', start: 0, erase: 2.89, end: 3.14 },
    { text: 'Then there was design...', start: 3.14, erase: 6.5, end: 6.75 },
    { text: 'The world changed with', start: 6.75, erase: Infinity, end: Infinity },
    { text: ' AI', start: 9.0, erase: Infinity, end: Infinity },
];

// A repeatable cadence keeps the text and orb on the same audio clock.
function characterTimes(text: string, pace = 1) {
    let elapsed = 0;
    return Array.from(text).map((character, index) => {
        elapsed += /[.,]/.test(character) ? .10 : character === ' ' ? .10 : [.06, .075, .05, .07, .085][index % 5];
        return elapsed * pace;
    });
}
const typingCues = introCues.map((cue, index) => ({
    ...cue,
    // Final letters land on the soundtrack attacks at 9.00s and 9.31s.
    characters: index === 3 ? [0, 0, .31] : characterTimes(cue.text, index === 0 ? .85 : 1),
}));
function cueText(cue: typeof typingCues[number], time: number) {
    const count = cue.characters.filter(at => time - cue.start >= at).length;
    const remaining = time < cue.erase ? count : Math.ceil(cue.text.length * Math.max(0, (cue.end - time) / (cue.end - cue.erase)));
    return remaining ? cue.text.slice(0, remaining) : '';
}
export function introText(time: number) {
    if (time < introCues[0].end) return cueText(typingCues[0], time);
    if (time < introCues[1].end) return cueText(typingCues[1], time);
    return cueText(typingCues[2], time) + cueText(typingCues[3], time);
}
function activeTypingCue(time: number) {
    return typingCues.find(cue => time >= cue.start && time < cue.start + cue.characters[cue.characters.length - 1]);
}

function finalAccent(time: number) {
    const cue = typingCues[3];
    const hit = [cue.start, cue.start + cue.characters[2]].filter(at => at <= time).pop();
    return hit === undefined ? 0 : Math.exp(-(time - hit) * 14);
}

const Hero: React.FC<{ audioElement: HTMLAudioElement; failed: boolean }> = ({ audioElement, failed }) => {
    const audio = useRef(audioElement);
    const orb = useRef<HTMLDivElement>(null);
    const graph = useRef<{ context: AudioContext; analyser: AnalyserNode }>();

    const [ready, setReady] = useState(false);
    const [started, setStarted] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [muted, setMuted] = useState(false);
    const [silentClock, setSilentClock] = useState(false);
    const hasStarted = useRef(false);
    const clockStart = useRef(0);
    const timeline = useRef(0);
    const timelineActive = useRef(false);
    const typingLevels = useRef<LevelSource>({
        read: () => {
            if (!timelineActive.current) return { bands: [0, 0, 0, 0], level: 0 };
            const t = timeline.current;
            const cue = activeTypingCue(t);
            const phase = cue === undefined ? 0 : (t - cue.start) % .18;
            const pulse = Math.max(finalAccent(t), cue === undefined ? 0 : .55 + .45 * Math.exp(-phase * 12));
            return { bands: [pulse * .75, pulse, pulse * .55, pulse * .25], level: pulse };
        },
    });

    const start = async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        setStarted(true);
        const element = audio.current;
        element.muted = false;
        setMuted(false);
        if (failed) {
            clockStart.current = performance.now();
            setSilentClock(true);
            return;
        }
        try {
            await element.play();
        } catch {
            element.muted = true;
            setMuted(true);
            try {
                await element.play();
            } catch {
                clockStart.current = performance.now();
                setSilentClock(true);
                return;
            }
        }
        setPlaying(true);
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
            // Audio analysis is optional.
        }
    };

    const toggleSound = () => {
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
        if (started) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const beginOnScroll = (event: Event) => {
            if (event instanceof WheelEvent && event.deltaY <= 0) return;
            if (event instanceof KeyboardEvent && (event.target instanceof Element && event.target.closest('button, a, input, textarea, select') || !['ArrowDown', 'PageDown', 'End', ' '].includes(event.key))) return;
            if (!ready) return;
            event.preventDefault();
            void start();
        };
        let touchY = 0;
        const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0].clientY; };
        const onTouchMove = (event: TouchEvent) => {
            if (event.touches[0].clientY < touchY - 10) beginOnScroll(event);
        };
        window.addEventListener('wheel', beginOnScroll, { passive: false });
        window.addEventListener('keydown', beginOnScroll);
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        const timer = ready ? setTimeout(() => void start(), 12000) : undefined;
        return () => {
            document.body.style.overflow = previousOverflow;
            clearTimeout(timer);
            window.removeEventListener('wheel', beginOnScroll);
            window.removeEventListener('keydown', beginOnScroll);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [ready, started]);

    useEffect(() => {
        if (!playing && !silentClock) return;
        let frame: number;
        const samples = new Uint8Array(128);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const tick = () => {
            const current = silentClock ? (performance.now() - clockStart.current) / 1000 : audio.current.currentTime;
            timelineActive.current = true;
            timeline.current = current;
            setTime(current);
            if (orb.current && !reduced) {
                let bass = 0;
                if (graph.current) {
                    graph.current.analyser.getByteFrequencyData(samples);
                    bass = samples.slice(0, 12).reduce((sum, value) => sum + value, 0) / (12 * 255);
                }
                const cue = activeTypingCue(current);
                const progress = cue === undefined ? 0 : (current - cue.start) / cue.characters[cue.characters.length - 1];
                const swell = cue === undefined ? 0 : Math.sin(Math.PI * progress);
                const beat = cue === undefined ? 0 : (1 + Math.sin(progress * Math.PI * 10)) / 2;
                orb.current.style.transform = `scale(${1 + bass * .025 + swell * (.045 + beat * .01) + finalAccent(current) * .06})`;
            }
            if (current < 10.6) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [playing, silentClock]);

    const typingCue = activeTypingCue(time);
    const typingMotion = typingCue === undefined ? 0 : Math.sin(Math.PI * (time - typingCue.start) / typingCue.characters[typingCue.characters.length - 1]);
    const activeParams = { ...params, speed: .2 + typingMotion * 1.3 };

    const phrase = time < introCues[0].end ? introCues[0].text : time < introCues[1].end ? introCues[1].text : introCues[2].text + introCues[3].text;

    return (
        <section id="hero" className="ux-hero" aria-label="Engineering, design, and AI">
            <div className={`ux-intro ${ready ? 'is-ready' : ''} ${time >= 10.1 ? 'is-complete' : ''}`}>
                {time < 10.6 && <><div ref={orb} className={`ux-orb ${!started ? 'is-waiting' : ''}`}><VoiceOrb palette="midnight" variant="painted" state={ready ? "talking" : "ready"} voice={typingLevels.current} seed={0.5} params={activeParams} size="clamp(200px, 30vw, 350px)" />
                <div className={`ux-orb-waiting ${started ? 'is-fading' : ''}`}><VoiceOrb palette={waitingPalette} variant="painted" state="ready" seed={0.5} params={waitingParams} size="clamp(200px, 30vw, 350px)" /></div>
                {ready && <button className={`ux-play ${started ? 'is-fading' : ''}`} onClick={() => void start()} disabled={started} tabIndex={started ? -1 : 0} aria-hidden={started} aria-label="Play introduction with sound"><span className="ux-play-shape" aria-hidden="true">
                    <svg className="ux-play-arrow" width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
                        <defs><linearGradient id="ux-arrow-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8264ff" /><stop offset=".5" stopColor="#e8dcff" /><stop offset="1" stopColor="#6d49ff" /></linearGradient></defs>
                        <path className="ux-arrow-base" d="M9 4 L38 21 L9 38 Z" />
                        <path className="ux-arrow-light ux-arrow-glow" d="M9 4 L38 21 L9 38 Z" />
                    </svg>

                </span></button>}
                </div>
                <p className="ux-intro-text" aria-hidden="true">
                    <span className="ux-text-slot">
                        <span className="ux-text-measure">{phrase}</span>
                        <span className="ux-text-reveal">{introText(time)}{started && <span className="ux-typing-caret" />}</span>
                    </span>
                </p></>}
            </div>
            <span className="ux-sr-only">First there was engineering. Then there was design. The world changed with AI.</span>
            
            {started && !failed && <button className="ux-sound" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted}>{muted ? <VolumeX size={22} /> : <Volume2 size={22} />}</button>}
        </section>
    );
};
export default Hero;
