import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, MousePointer2, SkipForward, RotateCcw } from 'lucide-react';
import VoiceOrb from '../../shared/voice-orb/components/VoiceOrb';
import type { LevelSource } from '../../shared/voice-orb/lib/orb/audio';
import './Hero.css';
import RoleCarousel from './RoleCarousel';
import Contents, { contentsEnd, traceDuration } from './Contents';
import FrameworkRule from './FrameworkRule';

const waitingPalette: [string, string, string, string] = ['#101010', '#121019', '#201948', '#362a80'];
const params = { speed: 2.8, warp: 1.5, sphere: 1.5, detail: 1.9, grain: 0.17, pulse: 0.57, highlight: 0.33, exposure: 0, saturation: 1.04, fluid: 0.21 };
const waitingParams = { ...params, speed: 1.1, warp: 1.1, detail: 1.4, grain: .09 };
const introCues = [
    { text: 'First there was engineering...', start: 0, erase: 2.89, end: 3.14 },
    { text: 'Then there was design...', start: 3.14, erase: 6.5, end: 6.75 },
    { text: 'The world changed with', start: 6.75, erase: Infinity, end: Infinity },
    { text: ' AI', start: 9.0, erase: Infinity, end: Infinity },
];

const cutCues = [
    { start: 12.06, text: 'But', size: 'regular' },
    { start: 13.08, text: 'What about all that', size: 'regular' },
    { start: 14.35, text: 'In 1', size: 'regular' },
    { start: 15.10, text: '1', size: 'large' },
    { start: 15.40, text: '1', size: 'larger' },
    { start: 15.70, text: '1', size: 'huge' },
    { start: 16.00, text: 'Person', size: 'regular' },
];
export function cutText(time: number) {
    return time >= 17.00 ? undefined : [...cutCues].reverse().find(cue => time >= cue.start);
}

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
    const startPrompt = useRef<HTMLSpanElement>(null);
    const [skipRevealCount, setSkipRevealCount] = useState(0);
    const soundButton = useRef<HTMLButtonElement>(null);
    const previousSoundLeft = useRef<number>();
    const graph = useRef<{ context: AudioContext; analyser: AnalyserNode }>();

    const [replayCount, setReplayCount] = useState(0);
    const [ready, setReady] = useState(false);
    const [started, setStarted] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [muted, setMuted] = useState(false);
    const [silentClock, setSilentClock] = useState(false);
    const hasStarted = useRef(false);
    const skipped = useRef(false);
    const [isSkipped, setIsSkipped] = useState(false);
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
            if (skipped.current) return;
            element.muted = true;
            setMuted(true);
            try {
                await element.play();
            } catch {
                if (skipped.current) return;
                clockStart.current = performance.now();
                setSilentClock(true);
                return;
            }
        }
        if (skipped.current) { element.pause(); return; }
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

    const replay = () => {
        audio.current.pause();
        audio.current.currentTime = 0;
        skipped.current = false;
        hasStarted.current = false;
        timeline.current = 0;
        timelineActive.current = false;
        previousSoundLeft.current = undefined;
        setTime(0);
        setIsSkipped(false);
        setSkipRevealCount(0);
        setSilentClock(false);
        setPlaying(false);
        setReplayCount(count => count + 1);
        void start();
        requestAnimationFrame(() => soundButton.current?.focus({ preventScroll: true }));
    };

    const skip = () => {
        skipped.current = true;
        hasStarted.current = true;
        audio.current.pause();
        setStarted(true);
        setPlaying(false);
        setSilentClock(false);
        setIsSkipped(true);
        timelineActive.current = false;
        timeline.current = contentsEnd;
        setTime(contentsEnd);
    };

    useEffect(() => {
        if (!isSkipped) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timers = [1, 2, 3].map(count => setTimeout(() => {
            setSkipRevealCount(count);
            if (count === 3) requestAnimationFrame(() => {
                document.querySelector<HTMLAnchorElement>('#contents a[tabindex="0"]')?.focus({ preventScroll: true });
            });
        }, reduced ? 0 : count * traceDuration * 1000));
        return () => timers.forEach(clearTimeout);
    }, [isSkipped]);

    useEffect(() => {
        if (!ready || started) return;
        const update = (event: PointerEvent) => {
            const prompt = startPrompt.current;
            if (!prompt) return;
            const bounds = prompt.getBoundingClientRect();
            const dx = Math.max(bounds.left - event.clientX, 0, event.clientX - bounds.right);
            const dy = Math.max(bounds.top - event.clientY, 0, event.clientY - bounds.bottom);
            const orbBounds = orb.current?.getBoundingClientRect();
            const orbDistance = orbBounds ? Math.max(0, Math.hypot(
                event.clientX - (orbBounds.left + orbBounds.width / 2),
                event.clientY - (orbBounds.top + orbBounds.height / 2),
            ) - orbBounds.width / 2) : Infinity;
            const proximity = Math.max(0, 1 - Math.min(Math.hypot(dx, dy), orbDistance) / 480);
            prompt.style.setProperty('--proximity', String(proximity));
            orb.current?.style.setProperty('--orb-proximity', String(proximity));
        };
        const reset = () => {
            startPrompt.current?.style.setProperty('--proximity', '0');
            orb.current?.style.setProperty('--orb-proximity', '0');
        };
        window.addEventListener('pointermove', update);
        document.addEventListener('pointerleave', reset);
        return () => {
            window.removeEventListener('pointermove', update);
            document.removeEventListener('pointerleave', reset);
        };
    }, [ready, started]);

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
        void document.fonts?.load('400 16px Asset');
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
        if (isSkipped || (!playing && !silentClock)) return;
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
            if (current < contentsEnd) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [playing, silentClock, isSkipped, replayCount]);

    const typingCue = activeTypingCue(time);
    const typingMotion = typingCue === undefined ? 0 : Math.sin(Math.PI * (time - typingCue.start) / typingCue.characters[typingCue.characters.length - 1]);
    const activeParams = { ...params, speed: .2 + typingMotion * 1.3 };

    const phrase = time < introCues[0].end ? introCues[0].text : time < introCues[1].end ? introCues[1].text : introCues[2].text + introCues[3].text;

    useLayoutEffect(() => {
        const button = soundButton.current;
        if (!button) return;
        const left = button.getBoundingClientRect().left;
        const previous = previousSoundLeft.current;
        previousSoundLeft.current = left;
        if (previous === undefined || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const distance = previous - left;
        if (Math.abs(distance) > 1) {
            button.animate([{ translate: `${distance}px 0` }, { translate: '0 0' }], { duration: 350, easing: 'ease-out' });
        }
    }, [phrase, failed]);

    const cut = cutText(time);
    const glitch = time >= 11.30 && time < 12.30;
    const glitchFrame = Math.floor(time * 24);

    return (
        <section id="hero" className="ux-hero" aria-label="Engineering, design, and AI">
            <svg className="ux-glitch-defs" aria-hidden="true">
                <defs>
                    <filter id="ux-hero-glitch" x="-10%" y="-5%" width="120%" height="110%" colorInterpolationFilters="sRGB">
                        <feTurbulence type="fractalNoise" baseFrequency="0 .018" numOctaves="1" seed={glitchFrame} result="noise" />
                        <feComponentTransfer in="noise" result="bands">
                            <feFuncR type="discrete" tableValues="0.1 0.25 0.4 0.6 0.75 0.9" />
                            <feFuncG type="linear" slope="0" intercept="0.5" />
                        </feComponentTransfer>
                        <feDisplacementMap in="SourceGraphic" in2="bands" scale={glitchFrame % 3 === 0 ? 100 : 38} xChannelSelector="R" yChannelSelector="G" result="shifted" />
                        <feColorMatrix in="shifted" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
                        <feOffset in="red" dx={glitchFrame % 2 ? 9 : -12} result="redShift" />
                        <feColorMatrix in="shifted" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
                        <feColorMatrix in="shifted" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
                        <feOffset in="blue" dx={glitchFrame % 2 ? -9 : 12} result="blueShift" />
                        <feComposite in="redShift" in2="green" operator="arithmetic" k2="1" k3="1" result="rg" />
                        <feComposite in="rg" in2="blueShift" operator="arithmetic" k2="1" k3="1" />
                    </filter>
                </defs>
            </svg>
            <div className={`ux-hero-scene ${isSkipped ? 'is-skipped' : ''} ${glitch ? 'is-glitching' : ''}`}>
            <div className={`ux-intro ${ready ? 'is-ready' : ''} ${time >= 12.06 ? 'is-complete' : ''}`}>
                {time < 12.06 && <><div ref={orb} className={`ux-orb ${!started ? 'is-waiting' : ''}`}><VoiceOrb palette="midnight" variant="painted" state={ready ? "talking" : "ready"} voice={typingLevels.current} seed={0.5} params={activeParams} size="clamp(200px, 30vw, 350px)" />
                <div className={`ux-orb-waiting ${started ? 'is-fading' : ''}`}><VoiceOrb palette={waitingPalette} variant="painted" state="ready" seed={0.5} params={waitingParams} size="clamp(200px, 30vw, 350px)" /></div>
                {ready && !started && <button className="ux-start-area" onClick={() => void start()} aria-label="Start animation with sound">
                    <span ref={startPrompt} className="ux-start-prompt"><span className="ux-start-label">Click me</span><MousePointer2 size={16} aria-hidden="true" /></span>
                </button>}
                </div>
                </>}
            </div>
            <div className={`ux-intro-caption ${!started ? 'is-waiting' : ''}`}>
                <div className={`ux-caption-content ${time >= 12.06 ? 'is-complete' : ''}`}>
                    {!failed && <button ref={soundButton} className={`ux-sound ${started ? 'is-visible' : ''}`} onClick={toggleSound} disabled={!started || time >= 12.06} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!muted} tabIndex={started && time < 12.06 ? 0 : -1} aria-hidden={!started || time >= 12.06}>{muted ? <VolumeX size={22} /> : <Volume2 size={22} />}</button>}
                    <p className={`ux-intro-text ${ready ? 'is-ready' : ''} ${time >= 12.06 ? 'is-complete' : ''}`} aria-hidden="true">
                        <span className="ux-text-slot">
                            <span className="ux-text-measure">{phrase}</span>
                            <span className="ux-text-reveal">{introText(time)}{started && <span className="ux-typing-caret" />}</span>
                        </span>
                    </p>
                </div>
            </div>
            {time >= 16 && <RoleCarousel time={time} />}
            <Contents key={replayCount} time={time} revealCount={isSkipped ? skipRevealCount : undefined} />
            {cut && <p className={`ux-cut-text ux-cut-text--${cut.size}`} aria-hidden="true">{cut.size === 'large' || cut.size === 'larger' || cut.size === 'huge' ? <span className="ux-cut-numeral"><span className="ux-numeral-measure">{cut.text}</span><svg className="ux-numeral-svg" aria-hidden="true">
                        {(cut.size === 'larger' || cut.size === 'huge') && Array.from({ length: cut.size === 'huge' ? 6 : 2 }, (_, index) => {
                            const ring = (cut.size === 'huge' ? 6 : 2) - index;
                            const shade = Math.round(16 + 239 * 0.5 / Math.pow(2, ring - 1));
                            return <React.Fragment key={ring}>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="none" stroke={`rgb(${shade}, ${shade}, ${shade})`} strokeWidth={ring * 100 + 4} strokeLinejoin="miter">1</text>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="none" stroke="#101010" strokeWidth={ring * 100} strokeLinejoin="miter">1</text>
                            </React.Fragment>;
                        })}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="white">{cut.text}</text>
                    </svg></span> : cut.text}</p>}
            </div>
            {time >= contentsEnd && (!isSkipped || skipRevealCount === 3) &&
                <button className="ux-replay" onClick={replay} aria-label="Replay animation" title="Replay animation"><RotateCcw size={18} aria-hidden="true" /></button>}
            {time >= 19.2 && <FrameworkRule className="ux-hero-title-rule" />}
            {ready && !isSkipped && time < 16.35 && <button className={`ux-skip ${time >= 16 ? 'is-hiding' : ''}`} onClick={skip} disabled={time >= 16} tabIndex={time >= 16 ? -1 : 0} aria-hidden={time >= 16}><SkipForward size={16} aria-hidden="true" />Skip Animation</button>}
            <span className="ux-sr-only">First there was engineering. Then there was design. The world changed with AI. But what about all that in one person?</span>

        </section>
    );
};
export default Hero;
