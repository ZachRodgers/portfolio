import { useEffect, useRef } from 'react';
import './GenerativeBuild.css';

export interface GenerativeBuildProps {
    /** Sections inside the parent element to construct as they enter view. */
    targets: string;
    resizeTargets?: string;
    progressTargets?: string;
    rearrangeTargets?: string;
    textTargets?: string;
    skipRevealTargets?: string;
    /** Duration multiplier; the default retains the portfolio choreography. */
    pace?: number;
    maxCursors?: number;
    cursorSrc?: string;
}

export default function GenerativeBuild({
    targets, resizeTargets, progressTargets, rearrangeTargets,
    textTargets = 'h1, h2, p', skipRevealTargets,
    pace = .58, maxCursors = 3, cursorSrc = '/assets/shared/agents/cursor.svg',
}: GenerativeBuildProps) {
    const anchor = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const root = anchor.current?.parentElement;
        if (!root) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motion.matches) return;
        const animations: Animation[] = [];
        const decorations: HTMLElement[] = [];
        const restorations: Array<() => void> = [];
        const sections = Array.from(root.querySelectorAll<HTMLElement>(targets));
        const lanes = Array.from({ length: Math.max(1, Math.floor(maxCursors)) }, () => ({ availableAt: 0, previous: null as HTMLElement | null }));
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                const section = entry.target as HTMLElement;
                const index = sections.indexOf(section);
                section.classList.add('generative-build-target');
                restorations.push(() => section.classList.remove('generative-build-target'));
                const now = performance.now();
                const lane = lanes.reduce((first, candidate) => candidate.availableAt < first.availableAt ? candidate : first);
                const delay = Math.max([0, 160, 80, 220, 120, 300][index % 6], lane.availableAt - now);
                const previous = lane.previous?.getBoundingClientRect();
                const bounds = section.getBoundingClientRect();
                const arrival = previous ? {
                    left: `${previous.left + previous.width * .76 - bounds.left}px`,
                    top: `${previous.top + previous.height * .08 - bounds.top}px`,
                } : { left: '-15px', top: '-18px' };
                lane.availableAt = now + delay + 4300 * pace;
                lane.previous = section;
                const animate = (node: Element, frames: Keyframe[], duration: number, offset = 0, easing = 'cubic-bezier(.22,.8,.25,1)') => {
                    const animation = node.animate(frames, { duration: duration * pace, delay: delay + offset * pace, easing, fill: 'backwards' });
                    animations.push(animation);
                    return animation;
                };
                const frame = document.createElement('span');
                frame.className = 'generative-selection';
                frame.setAttribute('aria-hidden', 'true');
                frame.innerHTML = '<i></i><i></i><i></i><i></i>';
                const cursor = document.createElement('span');
                cursor.className = 'generative-cursor';
                cursor.setAttribute('aria-hidden', 'true');
                const cursorImage = document.createElement('img');
                cursorImage.src = cursorSrc;
                cursorImage.alt = '';
                cursor.append(cursorImage, document.createElement('i'));
                section.append(frame, cursor);
                decorations.push(frame, cursor);
                const isLayout = Boolean(resizeTargets && section.matches(resizeTargets));
                // Width changes reflow the actual content. The outline follows its bounds.
                if (isLayout) animate(section, [
                    { width: '86%', offset: 0 },
                    { width: '86%', offset: .70 },
                    { width: '100%', offset: .79 },
                    { width: '100%' },
                ], 4300, 0, 'linear');
                // The cursor tip and the growing frame share the same corner coordinates.
                animate(frame, [
                    { opacity: 0, width: '0px', height: '0px', offset: 0 },
                    { opacity: .8, width: '0px', height: '0px', offset: .035 },
                    { opacity: .8, width: 'calc(100% + 18px)', height: 'calc(100% + 18px)', offset: .135 },
                    { opacity: .8, width: 'calc(100% + 18px)', height: 'calc(100% + 18px)', offset: .88 },
                    { opacity: 0, width: 'calc(100% + 18px)', height: 'calc(100% + 18px)', offset: .94 },
                    { opacity: 0, width: 'calc(100% + 18px)', height: 'calc(100% + 18px)' },
                ], 4300, 0, 'linear');
                const cursorAnimation = animate(cursor, [
                    { opacity: 0, ...arrival, offset: 0 },
                    { opacity: 1, ...arrival, offset: .01 },
                    { opacity: 1, left: '-9px', top: '-9px', offset: .035 },
                    { opacity: 1, left: 'calc(100% + 9px)', top: 'calc(100% + 9px)', offset: .135 },
                    { opacity: 1, left: 'calc(100% + 9px)', top: 'calc(100% + 9px)', offset: .15 },
                    { opacity: 1, left: '12%', top: '10%', offset: .23 },
                    { opacity: 1, left: '12%', top: '10%', offset: .59 },
                    { opacity: 1, left: 'calc(100% + 9px)', top: '50%', offset: .68 },
                    { opacity: 1, left: 'calc(100% + 9px)', top: '50%', offset: .81 },
                    { opacity: 1, left: '76%', top: '8%', offset: .95 },
                    { opacity: 0, left: '76%', top: '8%' },
                ], 4300, 0, 'linear');
                const pointer = cursor.querySelector('img');
                if (pointer) [150, 650, ...(isLayout ? [3000, 3400] : [])].forEach(at => {
                    animate(pointer, [
                        { transform: 'scale(1)' },
                        { transform: 'scale(1.28)', offset: .38 },
                        { transform: 'scale(.94)', offset: .72 },
                        { transform: 'scale(1)' },
                    ], 190, at).effect?.updateTiming({ fill: 'none' });
                });
                section.querySelectorAll<HTMLElement>(progressTargets || ':not(*)').forEach((bar, order) => {
                    const target = bar.style.getPropertyValue('--target-width');
                    animate(bar, [{ width: '0%' }, { width: target }], 580, 720 + order * 680);
                });
                const icons = Array.from(section.querySelectorAll<HTMLElement>(rearrangeTargets || ':not(*)'));
                if (icons.length > 1) {
                    const first = icons[0];
                    const second = icons[1];
                    const firstBox = first.getBoundingClientRect();
                    const secondBox = second.getBoundingClientRect();
                    const sectionBox = section.getBoundingClientRect();
                    const dx = secondBox.left - firstBox.left;
                    const dy = secondBox.top - firstBox.top;
                    // Start these two in each other's slots, then drag them into place.
                    [first, second].forEach((icon, order) => {
                        const x = order === 0 ? dx : -dx;
                        const y = order === 0 ? dy : -dy;
                        const start = order === 0 ? .30 : .55;
                        animate(icon, [
                            { transform: `translate(${x}px,${y}px)` },
                            { transform: `translate(${x}px,${y}px)`, offset: start },
                            { transform: `translate(${x}px,${y - 8}px) scale(1.08)`, offset: start + .04 },
                            { transform: 'translate(0,-8px) scale(1.08)', offset: start + .16 },
                            { transform: 'none', offset: start + .20 },
                            { transform: 'none' },
                        ], 4300, 0, 'linear');
                    });
                    const position = (box: DOMRect) => ({
                        left: `${box.left - sectionBox.left + box.width / 2}px`,
                        top: `${box.top - sectionBox.top + box.height / 2}px`,
                    });
                    const from = position(secondBox);
                    const to = position(firstBox);
                    (cursorAnimation.effect as KeyframeEffect | null)?.setKeyframes([
                        { opacity: 0, ...arrival, offset: 0 },
                        { opacity: 1, left: '-9px', top: '-9px', offset: .035 },
                        { opacity: 1, left: 'calc(100% + 9px)', top: 'calc(100% + 9px)', offset: .135 },
                        { opacity: 1, ...from, offset: .27 },
                        { opacity: 1, ...from, offset: .30 },
                        { opacity: 1, left: from.left, top: `calc(${from.top} - 8px)`, offset: .34 },
                        { opacity: 1, left: to.left, top: `calc(${to.top} - 8px)`, offset: .46 },
                        { opacity: 1, ...to, offset: .50 },
                        { opacity: 1, ...to, offset: .55 },
                        { opacity: 1, left: to.left, top: `calc(${to.top} - 8px)`, offset: .59 },
                        { opacity: 1, left: from.left, top: `calc(${from.top} - 8px)`, offset: .71 },
                        { opacity: 1, ...from, offset: .75 },
                        { opacity: 1, left: '76%', top: '8%', offset: .95 },
                        { opacity: 0, left: '76%', top: '8%' },
                    ]);
                    if (pointer) [1290, 2150, 2365, 3225].forEach(at => {
                        animate(pointer, [
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.25)', offset: .4 },
                            { transform: 'scale(1)' },
                        ], 160, at).effect?.updateTiming({ fill: 'none' });
                    });
                }
                const click = cursor.querySelector('i');
                if (click) animate(click, [
                    { opacity: 0, transform: 'scale(.2)' },
                    { opacity: .8, offset: .1 },
                    { opacity: 0, transform: 'scale(2.4)' },
                ], 200, 150);
                const children = Array.from(section.children).filter(node => node !== frame && node !== cursor);
                children.forEach((child, order) => {
                    if (skipRevealTargets && child.matches(skipRevealTargets)) return;
                    animate(child, [{ opacity: 0 }, { opacity: 1 }], 160, 380 + order * 80);
                });
                const texts = Array.from(section.querySelectorAll<HTMLElement>(textTargets));
                const totalCharacters = texts.reduce((sum, text) => sum + (text.textContent?.length || 0), 0);
                let typingStart = 520;
                texts.forEach(text => {
                    const content = text.textContent || '';
                    const duration = Math.max(90, 2450 * content.length / Math.max(1, totalCharacters));
                    const visual = document.createElement('span');
                    visual.setAttribute('aria-hidden', 'true');
                    visual.className = 'generative-typed-copy';
                    const original = document.createElement('span');
                    original.className = 'generative-text-accessible';
                    while (text.firstChild) original.append(text.firstChild);
                    text.append(original, visual);
                    restorations.push(() => {
                        visual.remove();
                        while (original.firstChild) text.insertBefore(original.firstChild, original);
                        original.remove();
                    });
                    Array.from(content).forEach((character, position) => {
                        const letter = document.createElement('span');
                        letter.textContent = character;
                        visual.append(letter);
                        animate(letter, [{ visibility: 'hidden' }, { visibility: 'visible' }], 1,
                            typingStart + duration * position / Math.max(1, content.length), 'steps(1,end)');
                        if (character.trim()) animate(letter, [
                            { boxShadow: '1px 0 0 currentColor' },
                            { boxShadow: '1px 0 0 currentColor' },
                        ], duration / Math.max(1, content.length),
                            typingStart + duration * position / Math.max(1, content.length), 'linear')
                            .effect?.updateTiming({ fill: 'none' });
                    });
                    typingStart += duration;
                });
            });
        }, { threshold: .12 });
        sections.forEach(section => observer.observe(section));
        const stop = () => { if (motion.matches) { observer.disconnect(); animations.forEach(animation => animation.cancel()); decorations.forEach(node => node.remove()); restorations.splice(0).forEach(restore => restore()); } };
        motion.addEventListener('change', stop);
        return () => {
            observer.disconnect();
            motion.removeEventListener('change', stop);
            animations.forEach(animation => animation.cancel());
            decorations.forEach(node => node.remove()); restorations.splice(0).forEach(restore => restore());
        };
    }, [targets, resizeTargets, progressTargets, rearrangeTargets, textTargets, skipRevealTargets, pace, maxCursors, cursorSrc]);
    return <span ref={anchor} hidden />;
}
