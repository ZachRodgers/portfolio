import React, {useCallback, useEffect, useRef, useState} from 'react';
import BrowserBar from './BrowserBar';
import {Check, ChevronDown} from 'lucide-react';
import MissionDemoFrame from '../mission-control/MissionDemoFrame';
import DesignRationale from '../mission-control/DesignRationale';

const pages = [
    {id:'analytics', label:'Analytics', title:'Understand activity at a glance', text:'Bring sign-ins, account distribution, upload cadence, and usage insights into one view. Administrators can identify active areas and investigate gaps in data delivery.'},
    {id:'users', label:'Users', title:'Manage access in one place', text:'Make roles, account status, and recent activity visible at a glance. Administrators can manage access and pause accounts from the same workspace their team uses.'},
    {id:'csv-uploads', label:'CSV Uploads', title:'Keep data moving', text:'Give administrators a clear audit trail for data extracts. Processing status, row counts, and upload times make it easier to spot a missed update and investigate what happened.'},
];
export default function AdminShowcase() {
    const [selected,setSelected]=useState('analytics');
    const [visible,setVisible]=useState(false);
    const [menuOpen,setMenuOpen]=useState(false);
    const section=useRef<HTMLElement>(null);
    const timer=useRef<number>();
    const lastInteraction=useRef(0);
    const selectorFocused=useRef(false);
    const menuRef=useRef<HTMLDivElement>(null);
    const triggerRef=useRef<HTMLButtonElement>(null);
    const optionRefs=useRef<Array<HTMLButtonElement | null>>([]);
    const arm=useCallback((delay:number)=>{
        window.clearTimeout(timer.current);
        if(selectorFocused.current || !visible || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer.current=window.setTimeout(()=>setSelected(value=>pages[(pages.findIndex(p=>p.id===value)+1)%pages.length].id),delay);
    },[visible]);
    const interact=useCallback(()=>{lastInteraction.current=Date.now();arm(10000)},[arm]);
    const change=useCallback((page:string)=>{if(pages.some(item=>item.id===page))setSelected(page)},[]);
    useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.15});if(section.current)observer.observe(section.current);return ()=>observer.disconnect()},[]);
    useEffect(()=>{arm(Math.max(4000,lastInteraction.current+10000-Date.now()));return ()=>window.clearTimeout(timer.current)},[arm,selected]);
    useEffect(()=>{const visibility=()=>{if(document.hidden)window.clearTimeout(timer.current);else arm(Math.max(4000,lastInteraction.current+10000-Date.now()))};document.addEventListener('visibilitychange',visibility);return ()=>document.removeEventListener('visibilitychange',visibility)},[arm]);
    useEffect(()=>{
        if(!menuOpen) return;
        const outside=(event:PointerEvent)=>{if(!menuRef.current?.contains(event.target as Node)){setMenuOpen(false);selectorFocused.current=false;interact()}};
        const frameFocus=()=>{window.setTimeout(()=>{if(document.activeElement instanceof HTMLIFrameElement){setMenuOpen(false);selectorFocused.current=false;interact()}},0)};
        document.addEventListener('pointerdown',outside);
        window.addEventListener('blur',frameFocus);
        return ()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('blur',frameFocus)};
    },[menuOpen,interact]);
    const openMenu=()=>{selectorFocused.current=true;window.clearTimeout(timer.current);setMenuOpen(true);requestAnimationFrame(()=>optionRefs.current[pages.findIndex(item=>item.id===selected)]?.focus())};
    const closeMenu=(restoreFocus:boolean)=>{setMenuOpen(false);if(restoreFocus)triggerRef.current?.focus();else {selectorFocused.current=false;interact()}};
    const page=pages.find(item=>item.id===selected) || pages[0];
    return <section ref={section} id="stockhub-admin" className="mission-overview stockhub-overview stockhub-tone-fourth" aria-label="Stockhub administration" onPointerDown={interact} onKeyDown={interact} onWheel={interact}>
        <div className="mission-overview-inner">
            <div className="stockhub-admin-top">
                <div ref={menuRef} className="stockhub-admin-select-wrap" onFocus={()=>{selectorFocused.current=true;window.clearTimeout(timer.current)}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node | null))closeMenu(false)}}>
                    <button ref={triggerRef} type="button" className="stockhub-admin-select-trigger" aria-label="Admin page" aria-haspopup="listbox" aria-expanded={menuOpen} aria-controls="stockhub-admin-menu" onClick={()=>menuOpen ? closeMenu(true) : openMenu()} onKeyDown={event=>{if(!menuOpen && (event.key==='ArrowDown' || event.key==='ArrowUp')){event.preventDefault();openMenu()}else if(event.key==='Escape' && menuOpen){event.preventDefault();closeMenu(true)}}}>
                        <span>{page.label}</span><ChevronDown size={15} aria-hidden="true" />
                    </button>
                    {menuOpen && <div id="stockhub-admin-menu" className="stockhub-admin-menu" role="listbox" aria-label="Admin pages">
                        {pages.map((item,index)=><button key={item.id} ref={node=>{optionRefs.current[index]=node}} type="button" role="option" aria-selected={selected===item.id} onClick={()=>{setSelected(item.id);closeMenu(true);interact()}} onKeyDown={event=>{let next=index;if(event.key==='ArrowDown')next=(index+1)%pages.length;else if(event.key==='ArrowUp')next=(index+pages.length-1)%pages.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=pages.length-1;else if(event.key==='Escape'){event.preventDefault();closeMenu(true);return}else return;event.preventDefault();optionRefs.current[next]?.focus()}}><span>{item.label}</span>{selected===item.id && <Check size={14} aria-hidden="true" />}</button>)}
                    </div>}
                </div>
                <div id="stockhub-admin-panel" className="stockhub-admin-description" aria-live="polite"><h3>Admin Mode</h3><p>{page.text}</p></div>
                <DesignRationale project="stockhub" page={3} />
            </div>
            <MissionDemoFrame src="/assets/ux_ui/content/portfolio/stockhub/demo/index.html?scene=admin" title="Stockhub interactive administration" showPause={false} themeControl browserBar={<BrowserBar />} nativeWidth={1440} nativeHeight={900} adminPage={selected} onAdminPageChange={change} onReplay={() => { interact(); setSelected('analytics'); }} onInteraction={interact} active={visible}/>
        </div>
    </section>;
}
