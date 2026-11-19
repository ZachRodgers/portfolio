import { footerProjects } from '../siteContent';
import useNavigationProjects from './hooks/useNavigationProjects';
import useHashScroll from '../shared/hooks/useHashScroll';
import React from 'react';


// Import sections
import Hero from './sections/Hero';
import Resume from '../shared/sections/Resume';
import Contents from './sections/Contents';
import Portfolio from './sections/Portfolio';
import Branding from '../shared/sections/Branding';

// Import components
import Footer from '../shared/components/Footer';
import DynamicNav from '../shared/components/DynamicNav';
import LoadingScreen from '../shared/components/LoadingScreen';

// Import hooks
import useAssetLoading from './hooks/useAssetLoading';

function IndustrialDesign() {
    const { isLoading } = useAssetLoading();
    const projects = useNavigationProjects();

    useHashScroll();

    return (
        <div className="App">
            <LoadingScreen isLoading={isLoading} />
            {!isLoading && (
                <>
                    <DynamicNav projects={projects} iconBasePath="/assets/industrial_design/icons/project_icons" />
                    <Hero />
                    <Resume dataUrl="/assets/industrial_design/resume/resume.json" />
                    <Contents />
                    <Portfolio />
                    <Branding />
                    <Footer projectSource={footerProjects} />
                </>
            )}
        </div>
    );
}

export default IndustrialDesign;
