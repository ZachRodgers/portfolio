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
])('%s renders the expected page', (path, content) => {
    window.history.replaceState(null, '', path);
    expect(renderToStaticMarkup(<App />)).toContain(content);
});

test.each(['/missing', '/missing/nested/', '/constructor', '/toString'])(
    '%s resolves to the default portfolio without adding a history entry',
    path => {
        window.history.replaceState(null, '', path + '?source=test#resume-section');
        const historyLength = window.history.length;
        expect(renderToStaticMarkup(<App />)).toContain('UX/UI portfolio');
        expect(window.location.pathname).toBe(DEFAULT_ROUTE);
        expect(window.location.search).toBe('?source=test');
        expect(window.location.hash).toBe('#resume-section');
        expect(window.history.length).toBe(historyLength);
    }
);

test.each([
    ['/design', '/industrial_design', 'Industrial portfolio'],
    ['/id', '/industrial_design', 'Industrial portfolio'],
    ['/ux-ui', '/ux_ui', 'UX/UI portfolio'],
    ['/ux', '/ux_ui', 'UX/UI portfolio'],
    ['/ui', '/ux_ui', 'UX/UI portfolio'],
    ['/uxui', '/ux_ui', 'UX/UI portfolio'],
])('%s resolves to %s and preserves query, hash, and history', (alias, route, content) => {
    for (const suffix of ['', '/']) {
        window.history.replaceState(null, '', alias + suffix + '?source=alias#resume-section');
        const historyLength = window.history.length;
        expect(renderToStaticMarkup(<App />)).toContain(content);
        expect(window.location.pathname).toBe(route);
        expect(window.location.search).toBe('?source=alias');
        expect(window.location.hash).toBe('#resume-section');
        expect(window.history.length).toBe(historyLength);
    }
});

test.each(['/ux-ui/contents/portfolio/mission-control', '/ux_ui/contents/portfolio/mission-control'])(
    '%s opens the project inside the UX/UI portfolio', path => {
        window.history.replaceState(null, '', path + '?preview=1');
        expect(renderToStaticMarkup(<App />)).toContain('UX/UI portfolio');
        expect(window.location.pathname).toBe('/ux_ui');
        expect(window.location.hash).toBe('#project-2');
        expect(window.location.search).toBe('?preview=1');
    }
);
