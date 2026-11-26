import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb, MousePointer2, Hand, Type, MessageSquare, Image, Square, Layers, PenTool, Paintbrush, Move, Check } from 'lucide-react';
import './design-rationale.css';

const notes = [
    { title: 'The ultimate partner.', text: 'Conversations with engineers and designers revealed a gap: the CLI can feel limiting, while much of an IDE goes unused. What could a workspace built for agentic work look like?' },
    { title: 'Planning matters.', text: 'Agents work best with a plan, but long Markdown files are easy to skim past. Mission Control brings plans to life with previews, graphics, and HTML that highlights what matters.' },
    { title: 'Designed for designers.', text: 'Feedback from designer friends shaped familiar, Figma-like controls, so they can work visually without reading code.' },
    { title: 'Backed by research.', text: 'Research points to faster codebase retrieval and challenges with visual consistency. Mission Control indexes the codebase and builds a brand reference from its components and colors, with visual controls for the team.' }
];
const stockhubNotes = [
    { title: 'Where to start', text: 'Thirty years of data lived in spreadsheets, with customer information shared through files and email. I designed a searchable inventory and location selector to make that information easier to find and share in one place.' },
    { title: 'Competitor breakdown', text: 'I broke down legacy tools, spreadsheets, and competing dashboards to understand where dense information became difficult to navigate. That research shaped a familiar table with expandable orders, keeping details close to the list.' },
    { title: 'The impossible challenge', text: 'A daily email was the starting point for stock alerts. I turned that report into a focused workspace with automated flags, then gave administrators controls for time windows and manual overrides when the numbers need context.' },
    { title: 'Super powers', text: 'Working without a database and within strict security requirements shaped the administration flows. I designed for controlled access, including multi-factor authentication, and the product passed a three-week security penetration test.' },
];

const arrows = [
    'M70 51 C38 49 42 27 44 11 M34 21 L44 10 L53 21',
    'M12 12 C17 37 42 48 76 39 M64 33 L77 39 L68 49',
    'M72 8 C48 17 73 35 66 61 C62 78 48 92 39 108 M38 96 L39 109 L52 106',
    'M12 45 C24 12 52 10 80 23 M69 15 L81 23 L69 30',
];

const choices = [
    [MousePointer2, 'Select', true], [Hand, 'Pan', true], [Move, 'Spacing', true],
    [Type, 'Text', true], [MessageSquare, 'Comment', true], [Paintbrush, 'Color', true],
    [Square, 'Divs', true], [Image, 'Images', false], [Layers, 'Components', false],
    [PenTool, 'Pen', false], [Square, 'Shapes', false],
] as const;

export default function DesignRationale({ page, project = 'mission' }: { page: number; project?: 'mission' | 'stockhub' }) {
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const open = pinned || (!dismissed && (hovered || focused));
    const note = (project === 'stockhub' ? stockhubNotes : notes)[page];
    const id = `${project}-rationale-${page}`;
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
    return <div ref={root} className={`mission-rationale mission-rationale--${page}${project === 'stockhub' ? ` stockhub-rationale stockhub-rationale--${page}` : ''}`} data-open={open}
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
            {project === 'stockhub' && page !== 1 && <svg className="rationale-arrow stockhub-rationale-arrow" viewBox="0 0 100 60" aria-hidden="true"><path className="rationale-arrow-shaft" pathLength="1" d={arrows[page === 2 ? 1 : 0].split(' M')[0]} /><path className="rationale-arrow-head" pathLength="1" d={`M${arrows[page === 2 ? 1 : 0].split(' M')[1]}`} /></svg>}
            {project === 'mission' && page !== 3 && <svg className="rationale-arrow" viewBox={page === 2 ? '0 0 100 120' : '0 0 100 60'} aria-hidden="true"><path className="rationale-arrow-shaft" pathLength="1" d={arrows[page].split(' M')[0]} /><path className="rationale-arrow-head" pathLength="1" d={`M${arrows[page].split(' M')[1]}`} /></svg>}
            <p>{note.text}</p>
            {project === 'mission' && page === 3 && <div className="rationale-sources"><a href="https://arxiv.org/abs/2608.01507" target="_blank" rel="noreferrer">Repository retrieval ↗</a><a href="https://www.mdpi.com/2073-431X/15/4/238" target="_blank" rel="noreferrer">Interface consistency ↗</a></div>}
            {project === 'stockhub' && page === 1 && <div className="stockhub-rationale-sketch" aria-label="Research sketches of a dense spreadsheet and a cluttered legacy interface">
                <div className="stockhub-sketch-sheet"><i/><div>{Array.from({length: 20}, (_, index) => <span key={index}/>)}</div><small>spreadsheet</small></div>
                <div className="stockhub-sketch-legacy"><i/><div><b/><b/><b/></div><span/><span/><span/><small>legacy tool</small></div>
            </div>}
            {project === 'mission' && page === 1 && <div className="rationale-wireframes" aria-label="Concept wireframes: conversation beside preview, then a review checklist">
                <div className="rationale-wireframe"><i/><div><span/><span/><span/></div><b/></div>
                <span className="rationale-sketch-note">make it tangible →</span>
                <div className="rationale-wireframe rationale-wireframe--tasks"><i/>{[1,2,3].map(n => <div key={n}><Check size={12}/><span/></div>)}</div>
            </div>}
            {project === 'mission' && page === 2 && <div className="rationale-tools">{choices.map(([Icon, label, keep]) => <div key={label} className={keep ? '' : 'is-cut'}><Icon size={21} strokeWidth={1.4}/><span>{label}</span></div>)}</div>}
            

        </aside>
    </div>;
}
