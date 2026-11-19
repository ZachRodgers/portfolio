import React from 'react';
import Hero from './sections/Hero';
import Resume from './sections/Resume';
import Contents from './sections/Contents';
import Portfolio from './sections/Portfolio';
import Branding from '../shared/sections/Branding';
import Footer from '../shared/components/Footer';
import DynamicNav from '../shared/components/DynamicNav';
import content from './content/page.json';

const UxUi: React.FC = () => (
    <div className="App">
        <DynamicNav projects={content.projects} />
        <Hero />
        <Resume />
        <Contents />
        <Portfolio />
        <Branding />
        <Footer />
    </div>
);

export default UxUi;
