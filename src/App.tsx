import React from 'react';
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
