import React from 'react';
import content from '../content/page.json';
import MissionControl from '../content/portfolio/mission-control';
import MissionControlPlanning from '../content/portfolio/mission-control/Planning';
import MissionControlBrowserDesign from '../content/portfolio/mission-control/BrowserDesign';
import MissionControlFeatures from '../content/portfolio/mission-control/Features';

const Portfolio: React.FC = () => (
    <div id="portfolio">
        {content.footerProjects.map(project => project.id === 'project-2' ? <MissionControl key={project.id} /> : <div key={project.id} id={project.id} />)}
        <MissionControlPlanning />
        <MissionControlBrowserDesign />
        <MissionControlFeatures />
    </div>
);

export default Portfolio;
