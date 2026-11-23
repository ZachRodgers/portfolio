import React from 'react';
import content from '../content/page.json';
import MissionControl from '../content/portfolio/mission-control';

const Portfolio: React.FC = () => (
    <div id="portfolio">
        {content.footerProjects.map(project => project.id === 'project-2' ? <MissionControl key={project.id} /> : <div key={project.id} id={project.id} />)}
    </div>
);

export default Portfolio;
