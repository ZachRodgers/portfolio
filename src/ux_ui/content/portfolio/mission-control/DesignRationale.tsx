import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, MousePointer2, Hand, Type, MessageSquare, Image, Square, Layers, Pencil, Paintbrush, Move, Check } from 'lucide-react';
import './design-rationale.css';

const notes = [
    { title: 'But why?', eyebrow: '01 / The workspace', text: 'A conversation alone can’t hold the whole project. Plans, previews, and changes belong together, so the next decision has context.', question: 'Interview prompt', prompt: 'Where does context get lost between the chat, editor, and preview?' },
    { title: 'Make the plan visible.', eyebrow: '02 / Planning & previews', text: 'Put something concrete beside the conversation. It’s easier to discuss a direction when you can see it.', question: 'Usability test to run', prompt: 'Can someone compare directions and identify the next step?' },
    { title: 'What makes the cut?', eyebrow: '03 / Design Mode', text: 'Familiar visual controls, focused on editing a real page. An initial scope to test with designers:', question: 'Test the boundary', prompt: 'Direct manipulation or a comment? Test where designers draw the line.' },
    { title: 'Keep the intent intact.', eyebrow: '04 / Consistency', text: 'One good screen isn’t enough. A shared reference for type, color, and components helps the next screen feel like part of the same product.', question: 'Validation plan', prompt: 'Compare a second screen with and without a brand reference. Track visual drift and correction effort.' }
];
const arrows = [
    'M87 10 C48 2 71 43 21 45 M32 34 L20 45 L35 51',
    'M12 12 C17 37 42 48 76 39 M64 33 L77 39 L68 49',
    'M88 48 C55 56 68 14 27 17 M39 9 L26 17 L38 25',
    'M12 45 C24 12 52 10 80 23 M69 15 L81 23 L69 30',
];

const choices = [
    [MousePointer2, 'Select', true], [Hand, 'Pan', true], [Move, 'Spacing', true],
    [Type, 'Text', true], [MessageSquare, 'Comment', true], [Paintbrush, 'Color', true],
    [Image, 'Images', true], [Square, 'Corners', true], [Layers, 'Components', false],
    [Pencil, 'Freehand', false], [Square, 'Vector shapes', false], [Layers, 'Layer effects', false],
] as const;

export default function DesignRationale({ page }: { page: number }) {
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const open = pinned || (!dismissed && (hovered || focused));
    const note = notes[page];
    const id = `mission-rationale-${page}`;
    const close = () => { setPinned(false); setDismissed(true); };
    useEffect(() => {
        if (!open) return;
        const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { setPinned(false); setDismissed(true); trigger.current?.focus(); } };
        const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) { setPinned(false); setDismissed(true); } };
        const frameFocus = () => {
            window.setTimeout(() => {
                if (document.activeElement instanceof HTMLIFrameElement) close();
            }, 0);
        };
        document.addEventListener('keydown', key);
        window.addEventListener('blur', frameFocus);
        document.addEventListener('pointerdown', outside);
        return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); window.removeEventListener('blur', frameFocus); };
    }, [open]);
    return <div ref={root} className={`mission-rationale mission-rationale--${page}`} data-open={open}
        onPointerEnter={event => { if (event.pointerType === 'mouse') { setHovered(true); setDismissed(false); } }}
        onPointerLeave={() => setHovered(false)}
        onFocus={event => { if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setFocused(true); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}>
        <button ref={trigger} className="rationale-trigger" aria-expanded={open} aria-controls={id} aria-label={`Design rationale: ${note.title}`}
            onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setDismissed(false); }}
            onClick={() => { if (pinned) close(); else { setDismissed(false); setPinned(true); } }}>
            <Lightbulb size={25} strokeWidth={1.5} /><span>but why?</span>
        </button>
        <aside id={id} className={`rationale-paper${pinned ? ' is-pinned' : ''}`} aria-label={`Design rationale: ${note.title}`} aria-hidden={!open}>
            <h3 className="rationale-title">{note.title}</h3>
            <svg className="rationale-arrow" viewBox="0 0 100 60" aria-hidden="true"><path className="rationale-arrow-shaft" pathLength="1" d={arrows[page].split(' M')[0]} /><path className="rationale-arrow-head" pathLength="1" d={`M${arrows[page].split(' M')[1]}`} /></svg>
            <p>{note.text}</p>
            {page === 1 && <div className="rationale-wireframes" aria-label="Concept wireframes: conversation beside preview, then a review checklist">
                <div className="rationale-wireframe"><i/><div><span/><span/><span/></div><b/></div>
                <span className="rationale-sketch-note">make it tangible →</span>
                <div className="rationale-wireframe rationale-wireframe--tasks"><i/>{[1,2,3].map(n => <div key={n}><Check size={12}/><span/></div>)}</div>
            </div>}
            {page === 2 && <div className="rationale-tools">{choices.map(([Icon, label, keep]) => <div key={label} className={keep ? '' : 'is-cut'}><Icon size={21} strokeWidth={1.4}/><span>{label}</span></div>)}</div>}
            

        </aside>
    </div>;
}
