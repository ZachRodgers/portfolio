import React from 'react';
import { Lightbulb } from 'lucide-react';
import MissionDemoFrame from '../mission-control/MissionDemoFrame';
import '../stockhub/stockhub.css';
import '../mission-control/design-rationale.css';
export default function Parallel() {
 return <section className="mission-overview stockhub-overview stockhub-tone-inventory" aria-label="Parallel Operator interactive tutorial">
  <div className="mission-overview-inner">
   <MissionDemoFrame src="/assets/ux_ui/content/portfolio/parallel/demo/index.html" title="Parallel Operator interactive tutorial" showPause={false} nativeWidth={1440} nativeHeight={900} browserBar={<div className="stockhub-browser-bar"><div className="stockhub-browser-address"><span>operator.parkwithparallel.com</span></div></div>}/>
   <div className="mission-feature-grid">
    <article><h3>Learn by doing</h3><p>A guided walkthrough brings the operator portal to life. Explore parking analytics, adjust pricing, and manage vehicles with highlights that lead you to the next action.</p></article>
    <article><h3>From question to action</h3><p>Ask about your lot, review a proposed change, and approve it right in the conversation. This interactive demo uses fictional parking data and simulated responses.</p></article>
   </div>
  </div>
  <div className="mission-rationale"><button className="rationale-trigger" disabled title="Design rationale coming soon"><Lightbulb size={18}/><span>But why?</span></button></div>
 </section>;
}
