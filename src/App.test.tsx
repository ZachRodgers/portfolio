import { jest, test, expect } from '@jest/globals';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App, { DEFAULT_ROUTE } from './App';

jest.mock('./industrial_design/IndustrialDesign', () => () => <div>Industrial portfolio</div>);
jest.mock('./ux_ui/UxUi', () => () => <div>UX/UI portfolio</div>);
jest.mock('./recipes/Recipes', () => () => <div>Recipes</div>);

test('root resolves to the configured portfolio and preserves query and hash', () => {
    window.history.replaceState(null, '', '/?source=test#resume');
    expect(renderToStaticMarkup(<App />)).toContain('UX/UI portfolio');
    expect(window.location.pathname).toBe(DEFAULT_ROUTE);
    expect(window.location.search).toBe('?source=test');
    expect(window.location.hash).toBe('#resume');
});

test.each([
    ['/industrial_design', 'Industrial portfolio'],
    ['/industrial_design/', 'Industrial portfolio'],
    ['/ux_ui', 'UX/UI portfolio'],
    ['/industrial_design?source=footer#resume', 'Industrial portfolio'],
    ['/recipes', 'Recipes'],
    ['/recipes/', 'Recipes'],
    ['/missing', 'Page not found'],
])('%s renders the expected page', (path, content) => {
    window.history.replaceState(null, '', path);
    expect(renderToStaticMarkup(<App />)).toContain(content);
});
