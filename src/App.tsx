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

function App() {
    return (
        <div className="App">
            <Hero />
            <Resume />
            <Contents />
            <Portfolio />
            <Branding />
            <Footer />
        </div>
    );
}

export default App;
