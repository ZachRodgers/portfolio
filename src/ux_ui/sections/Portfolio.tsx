import React from 'react';
import content from '../content/page.json';

const Portfolio: React.FC = () => (
    <div id="portfolio">
        {content.footerProjects.map(project => <div key={project.id} id={project.id} />)}
    </div>
);

export default Portfolio;
