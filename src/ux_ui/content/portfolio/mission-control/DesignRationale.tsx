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

const parallelNotes = [
    { title: 'From idea to product', text: 'At Parallel I brought together what I learned in school and at work: researching competitors, shaping a business plan, and turning ideas into prototypes. Mockups and prepared assets gave us a way to test decisions before building a real product.' },
    { title: 'Operator Walkthrough', text: 'The operator portal has a lot to discover, so I designed the walkthrough around a practical workflow rather than a tour of every control. Contextual prompts introduce actions in place, using progressive disclosure to reduce cognitive load and help users build confidence.' },
    { title: 'Superadmin', text: 'Our internal team needed to investigate and intervene across the system. I organized cameras, plate reads, sessions and disputes into distinct views, using clear hierarchy and familiar patterns to make dense operational information easier to scan and act on.' },
    { title: 'User Centric', text: 'The app brought payments and the wider system together for drivers. I used a minimal interface, clear status and a focused payment flow to reduce friction and make the next step obvious. Early wireframes helped me work through that hierarchy before refining the screens.' },
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

export default function DesignRationale({ page, project = 'mission' }: { page: number; project?: 'mission' | 'stockhub' | 'parallel' }) {
    const [hovered, setHovered] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [focused, setFocused] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const open = pinned || (!dismissed && (hovered || focused));
    const note = (project === 'parallel' ? parallelNotes : project === 'stockhub' ? stockhubNotes : notes)[page];
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
    return <div ref={root} className={`mission-rationale mission-rationale--${page}${project === 'stockhub' ? ` stockhub-rationale stockhub-rationale--${page}` : project === 'parallel' ? ' parallel-rationale' : ''}`} data-open={open}
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
            {(project === 'mission' && page !== 3 || project === 'parallel') && <svg className="rationale-arrow" viewBox={page === 2 ? '0 0 100 120' : '0 0 100 60'} aria-hidden="true"><path className="rationale-arrow-shaft" pathLength="1" d={(project === 'parallel' && page === 1 ? 'M65 8 C57 23 48 38 30 52 M32 39 L29 53 L43 50' : arrows[page]).split(' M')[0]} /><path className="rationale-arrow-head" pathLength="1" d={`M${(project === 'parallel' && page === 1 ? 'M65 8 C57 23 48 38 30 52 M32 39 L29 53 L43 50' : arrows[page]).split(' M')[1]}`} /></svg>}
            <p>{note.text}</p>
            {project === 'parallel' && (page === 1 || page === 2) && <div className="rationale-tools parallel-rationale-icons" aria-label={page === 1 ? 'Operator pages' : 'Superadmin pages'}>{(page === 1 ? [['Dashboard', 'Dashboard'], ['AI', 'Parallel AI'], ['Occupants', 'Occupants'], ['Registry', 'Registry'], ['Violators', 'Violators'], ['Notifications', 'Notifications'], ['Settings', 'Settings'], ['Advanced', 'Advanced'], ['Addons', 'Addons'], ['Users', 'Users']] : [['Cameras', 'Cameras'], ['ALPRLog', 'ALPR Log'], ['Sessions', 'Sessions'], ['Disputes', 'Disputes']]).map(([icon, label]) => <div key={icon}><img className={['Dashboard', 'AI', 'Registry', 'Violators'].includes(icon) ? 'has-inset' : ''} src={`/assets/ux_ui/content/portfolio/parallel/demo/assets/nav/${icon}.svg`} alt=""/><span>{label}</span></div>)}</div>}
            {project === 'parallel' && page === 3 && <div className="parallel-app-sketches" role="img" aria-label="Five app wireframes: map, parking details, payment, confirmation and reminders">
                <div className="parallel-app-sketch sketch-screen-map"><i/><b/><span/><em/></div>
                <div className="parallel-app-sketch sketch-screen-detail"><i/><span/><b/><span/><em/></div>
                <div className="parallel-app-sketch sketch-screen-payment"><i/><span/><span/><b/><em/></div>
                <div className="parallel-app-sketch sketch-screen-confirmation"><i/><b/><span/><span/><em/></div>
                <div className="parallel-app-sketch sketch-screen-reminders"><i/><span/><b/><span/><b/></div>
            </div>}
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
