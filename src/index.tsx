import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import Recipes from './sections/Recipes';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isRecipesRoute =
    normalizedPath === '/recipes' ||
    normalizedPath.endsWith('/recipes');

root.render(
    <React.StrictMode>
        {isRecipesRoute ? <Recipes /> : <App />}
    </React.StrictMode>
);
