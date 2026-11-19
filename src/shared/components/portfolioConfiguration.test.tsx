import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import DynamicNav from './DynamicNav';
import Footer from './Footer';

let root: Root;
let container: HTMLDivElement;
const originalFetch = globalThis.fetch;
const originalWidth = window.innerWidth;

beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
    window.history.replaceState(null, '', '/');
    globalThis.fetch = originalFetch;
    window.innerWidth = originalWidth;
    jest.restoreAllMocks();
});

test('navigation uses supplied projects and icon paths without fetching portfolio data', () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    window.innerWidth = 1600;
    act(() => root.render(
        <DynamicNav projects={[{ number: 8, name: 'Research', iconName: 'research', pages: [] }]}
            iconBasePath="/assets/example/icons" />
    ));
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/assets/example/icons/research.svg');
    expect(fetchMock).not.toHaveBeenCalled();
});

test('footer uses configured project data, icons, and local project route', async () => {
    window.history.replaceState(null, '', '/example/');
    const target = document.createElement('div');
    target.id = 'project-1';
    const scroll = jest.fn();
    target.scrollIntoView = scroll;
    document.body.appendChild(target);
    const fetchMock = jest.fn(async (url: unknown) => ({
        ok: true,
        json: async () => url === '/example/projects.json'
            ? { projects: { '1': { name: 'Example', description: 'Example project' } } }
            : [],
    }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    await act(async () => root.render(
        <Footer projectSource={{
            dataUrl: '/example/projects.json',
            route: '/example',
            icons: { Example: '/example/icon.svg' },
        }} />
    ));
    expect(fetchMock).toHaveBeenCalledWith('/example/projects.json');
    expect(container.querySelector('.footer-project-icon')?.getAttribute('src')).toBe('/example/icon.svg');
    const projectButton = Array.from(container.querySelectorAll('button'))
        .find(button => button.textContent === 'Example');
    act(() => projectButton?.click());
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth' });
});
