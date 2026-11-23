import React from 'react';
import MissionControl from '../content/portfolio/mission-control';
import MissionControlPlanning from '../content/portfolio/mission-control/Planning';
import MissionControlBrowserDesign from '../content/portfolio/mission-control/BrowserDesign';
import MissionControlFeatures from '../content/portfolio/mission-control/Features';
import FrameworkRule from './FrameworkRule';

const ProjectPlaceholder = ({ id, name, logo, description }: { id: string; name: string; logo: string; description: string }) => <section id={id} className="ux-project ux-framework-section" aria-label={`${name} project`}>
    <FrameworkRule />
    <header className="mission-project-hero mission-project-hero--placeholder">
        <div className="mission-project-identity"><img src={logo} alt={name} /></div>
        <h2>{description}</h2>
    </header>
</section>;

const Portfolio: React.FC = () => (
    <div id="portfolio">
        <ProjectPlaceholder id="project-1" name="Parallel" logo="/assets/ux_ui/hero/parallel.png" description="An AI-powered parking platform for drivers and operators." />
        <section id="project-2" className="ux-project ux-framework-section" aria-labelledby="mission-project-title">
            <FrameworkRule />
            <header className="mission-project-hero">
                <div className="mission-project-identity"><img src="/assets/ux_ui/hero/mission_control.png" alt="Mission Control" /></div>
                <h2 id="mission-project-title">A coding workspace for engineers and designers, from first idea to finished code.</h2>
            </header>
            <MissionControl />
            <MissionControlPlanning />
            <MissionControlBrowserDesign />
            <MissionControlFeatures />
        </section>
        <ProjectPlaceholder id="project-3" name="Stockhub" logo="/assets/ux_ui/hero/stockhub.png" description="A modern dashboard that makes 50 years of product data easy to use." />
    </div>
);

export default Portfolio;
