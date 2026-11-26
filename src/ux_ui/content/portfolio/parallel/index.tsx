import React from 'react';
import DesignRationale from '../mission-control/DesignRationale';
import BrowserBar from './BrowserBar';
import Setup from './Setup';
import OperatorVideo from './OperatorVideo';
import './parallel-setup.css';
import MissionDemoFrame from '../mission-control/MissionDemoFrame';
import '../stockhub/stockhub.css';
import '../mission-control/design-rationale.css';
import MobileApp from './MobileApp';
export default function Parallel() {
 return <>
 <OperatorVideo />
 <section className="mission-overview parallel-setup" aria-label="Explore Parallel setup">
  <div className="mission-overview-inner parallel-setup-inner">
   <Setup />
  </div>
 </section>
 <section className="mission-overview stockhub-overview stockhub-tone-inventory" aria-label="Parallel Operator interactive tutorial">
  <div className="mission-overview-inner">
   <MissionDemoFrame src="/assets/ux_ui/content/portfolio/parallel/demo/index.html" title="Parallel Operator interactive tutorial" showPause={false} themeControl scaleMethod="zoom" nativeWidth={1440} nativeHeight={900} browserBar={<BrowserBar />}/>
   <div className="mission-feature-grid">
    <article><h3>Operator Portal</h3><p>We designed the operator portal around our customers, drawing on market research and conversations with parking operators. Their day-to-day needs shaped a single place to understand and manage their lots.</p></article>
    <article><h3>Parallel AI</h3><p>Customers and the industry wanted a more efficient, automated way to manage parking. Parallel AI brought that into the portal, helping operators turn questions into action. It became a selling point in our acquisition.</p></article>
   </div>
  </div>
  <DesignRationale project="parallel" page={1} />
 </section>
 <section className="mission-overview stockhub-overview stockhub-tone-orders" aria-label="Parallel Superadmin interactive demo">
  <div className="mission-overview-inner">
   <MissionDemoFrame src="/assets/ux_ui/content/portfolio/parallel/superadmin/index.html" title="Parallel Superadmin interactive demo" showPause={false} themeControl scaleMethod="zoom" nativeWidth={1440} nativeHeight={900} browserBar={<BrowserBar />}/>
   <div className="mission-feature-grid">
    <article><h3>Superadmin</h3><p>Manage the devices and records behind a parking lot. Explore cameras, plate recognition events, parking sessions, and disputes in one workspace.</p></article>
    <article><h3>Automation</h3><p>Parallel is designed to run automatically. Once cameras are online, AI handles plate recognition while the system manages tasks like billing and reboots. Superadmins can see what is happening, diagnose issues, and step in when needed.</p></article>
   </div>
  </div>
  <DesignRationale project="parallel" page={2} />
 </section>
 <MobileApp />
 </>;
}
