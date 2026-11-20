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
import content from './content/page.json';
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
            <DynamicNav projects={content.projects} iconBasePath={content.projectIconBasePath} />
            <Hero audioElement={audio} failed={failed} />
            <div className="ux-framework-section"><FrameworkRule /><Resume /></div>
            <Portfolio />
            <div className="ux-framework-section"><FrameworkRule /><Branding /></div>
            <div className="ux-framework-section"><FrameworkRule />
            <Footer projectSource={uxFooterProjects} currentRoute="/ux_ui" mainRoute={mainRoute} resumeRoute="/ux_ui" pages={footerPages} />
            </div>
            </>}
        </div>
    );
};

export default UxUi;
