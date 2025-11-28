import React, { useEffect } from 'react';
import './App.css';

// Import sections
import Hero from './sections/Hero';
import Resume from './sections/Resume';
import Contents from './sections/Contents';
import Portfolio from './sections/Portfolio';
import Branding from './sections/Branding';

// Import components
import Footer from './components/Footer';
import DynamicNav from './components/DynamicNav';
import LoadingScreen from './components/LoadingScreen';

// Import hooks
import useAssetLoading from './hooks/useAssetLoading';

function App() {
    const { isLoading } = useAssetLoading();

    useEffect(() => {
        if (isLoading) return;

        const hash = window.location.hash.replace('#', '');
        if (!hash) return;

        const scrollToHash = () => {
            const target = document.getElementById(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        };

        // Attempt immediately and once more after a tick to account for layout
        scrollToHash();
        const timeoutId = setTimeout(scrollToHash, 150);

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    return (
        <div className="App">
            <LoadingScreen isLoading={isLoading} />
            {!isLoading && (
                <>
                    <DynamicNav />
                    <Hero />
                    <Resume />
                    <Contents />
                    <Portfolio />
                    <Branding />
                    <Footer />
                </>
            )}
        </div>
    );
}

export default App;
