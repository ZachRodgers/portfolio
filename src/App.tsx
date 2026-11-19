import React from 'react';
import './App.css';
import IndustrialDesign from './industrial_design/IndustrialDesign';
import UxUi from './ux_ui/UxUi';
import Recipes from './recipes/Recipes';

export const DEFAULT_ROUTE = '/ux_ui';

function App() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';

    if (path === '/') {
        window.history.replaceState(null, '', DEFAULT_ROUTE + window.location.search + window.location.hash);
    }

    switch (path === '/' ? DEFAULT_ROUTE : path) {
        case '/industrial_design':
            return <IndustrialDesign />;
        case '/recipes':
            return <Recipes />;
        case '/ux_ui':
            return <UxUi />;
        default:
            return <main><h1>Page not found</h1><a href={DEFAULT_ROUTE}>View portfolio</a></main>;
    }
}

export default App;
