import { uxFooterProjects, footerPages, PageProps } from '../siteContent';
import useHashScroll from '../shared/hooks/useHashScroll';
import React, { useEffect, useState } from 'react';
import LoadingScreen from '../shared/components/LoadingScreen';
import Hero from './sections/Hero';
import Resume from './sections/Resume';
import Portfolio from './sections/Portfolio';
import Branding from '../shared/sections/Branding';
import Footer from '../shared/components/Footer';
import DynamicNav from '../shared/components/DynamicNav';
const projects = [
    { number: 1, name: 'Parallel', iconName: 'parallel', iconPath: '/assets/ux_ui/hero/parallel.png', sections: [['Overview', 'parallel-video'], ['Setup', 'parallel-setup'], ['Operator Portal', 'parallel-operator'], ['Superadmin', 'parallel-superadmin'], ['Mobile App', 'parallel-mobile']] },
    { number: 2, name: 'Mission Control', iconName: 'mission_control', iconPath: '/assets/ux_ui/hero/mission_control.png', sections: [['Workflows', 'mission-control-workflows'], ['Planning', 'mission-control-planning'], ['Browser Design', 'mission-control-browser-design'], ['Features', 'mission-control-features']] },
    { number: 3, name: 'Stockhub', iconName: 'stockhub', iconPath: '/assets/ux_ui/hero/stockhub.png', sections: [['Inventory', 'stockhub-inventory'], ['Orders', 'stockhub-orders'], ['Stock Alerts', 'stockhub-alerts'], ['Admin', 'stockhub-admin']] },
].map(project => ({ ...project, pages: project.sections.map(([pageName, sectionId], index) => ({ projectNumber: project.number, projectName: project.name, pageNumber: index + 1, pageName, sectionId, fileName: '', fullPath: '' })) }));
import FrameworkRule from './sections/FrameworkRule';
import './UxUi.css';

const UxUi: React.FC<PageProps> = ({ mainRoute }) => {
    const [audio] = useState(() => new Audio('/assets/ux_ui/hero/hero.mp3'));
    const [isLoading, setIsLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let disposed = false;
        let delay: ReturnType<typeof setTimeout>;
        let settled = false;
        const finish = async () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            await Promise.race([
                document.fonts.load('400 24px Merriweather').catch(() => {}),
                new Promise(resolve => setTimeout(resolve, 4000)),
            ]);
            if (!disposed) delay = setTimeout(() => setIsLoading(false), 1000);
        };
        const error = () => { setFailed(true); void finish(); };
        const timeout = setTimeout(error, 15000);
        audio.preload = 'auto';
        audio.addEventListener('canplaythrough', finish);
        audio.addEventListener('error', error);
        audio.load();
        if (audio.readyState >= 4) void finish();
        return () => {
            disposed = true;
            clearTimeout(timeout);
            clearTimeout(delay);
            audio.removeEventListener('canplaythrough', finish);
            audio.removeEventListener('error', error);
            audio.pause();
        };
    }, [audio]);
    useHashScroll();
    return (
        <div className="App ux-page">
            <LoadingScreen isLoading={isLoading} />
            {!isLoading && <>
            <Hero audioElement={audio} failed={failed} />
            <div className="ux-framework-section"><FrameworkRule className="ux-resume-rule" /><Resume /></div>
            <Portfolio navigation={<DynamicNav projects={projects} iconBasePath="" />} />
            <div className="ux-framework-section"><FrameworkRule /><Branding /></div>
            <div className="ux-framework-section"><FrameworkRule />
            <Footer projectSource={uxFooterProjects} currentRoute="/ux_ui" mainRoute={mainRoute} resumeRoute="/ux_ui" pages={footerPages} />
            </div>
            </>}
        </div>
    );
};

export default UxUi;
