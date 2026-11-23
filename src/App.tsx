import React from 'react';
import './App.css';
import IndustrialDesign from './industrial_design/IndustrialDesign';
import UxUi from './ux_ui/UxUi';
import Recipes from './recipes/Recipes';

const pages = {
    '/industrial_design': IndustrialDesign,
    '/ux_ui': UxUi,
    '/recipes': Recipes,
};

const aliases: Record<string, keyof typeof pages> = {
    '/design': '/industrial_design',
    '/id': '/industrial_design',
    '/ux-ui': '/ux_ui',
    '/ux': '/ux_ui',
    '/ui': '/ux_ui',
    '/uxui': '/ux_ui',
};

export const DEFAULT_ROUTE: keyof typeof pages = '/ux_ui';

function App() {
    if (/^\/(ux-ui|ux_ui)\/contents\/portfolio\/mission-control\/?$/.test(window.location.pathname)) {
        window.history.replaceState(null, '', '/ux_ui' + window.location.search + '#project-2');
    }
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const isKnownRoute = Object.prototype.hasOwnProperty.call(pages, path);
    const alias = Object.prototype.hasOwnProperty.call(aliases, path) ? aliases[path] : undefined;
    const route = isKnownRoute ? path as keyof typeof pages : alias || DEFAULT_ROUTE;

    if (!isKnownRoute) {
        window.history.replaceState(null, '', route + window.location.search + window.location.hash);
    }

    const Page = pages[route];
    return <Page mainRoute={DEFAULT_ROUTE} />;
}

export default App;
