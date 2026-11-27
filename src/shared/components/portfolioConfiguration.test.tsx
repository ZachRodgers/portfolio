import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import DynamicNav from './DynamicNav';
import Footer from './Footer';
import { footerPages, industrialFooterProjects, uxFooterProjects } from '../../siteContent';

jest.mock('./modals/PDFModal', () => ({ isOpen, title }: { isOpen: boolean; title: string }) =>
    isOpen ? <div role="dialog">{title}</div> : null);


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
        <Footer currentRoute="/example" mainRoute="/example" resumeRoute="/example" pages={[]} projectSource={{
            dataUrl: '/example/projects.json',
            route: '/example',
            icons: { Example: '/example/icon.svg' },
        }} />
    ));
    expect(fetchMock).toHaveBeenCalledWith('/example/projects.json');
    expect(container.querySelector('.footer-project-icon')?.getAttribute('src')).toBe('/example/icon.svg');
    const projectButton = Array.from(container.querySelectorAll('a'))
        .find(button => button.textContent === 'Example');
    act(() => projectButton?.click());
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth' });
});

test.each([
    ['/ux_ui', uxFooterProjects, ['Home', 'Resume', 'Design', 'Recipes'], '/ux_ui'],
    ['/industrial_design', industrialFooterProjects, ['Top', 'Resume', 'UX/UI', 'Recipes'], '/ux_ui'],
    ['/industrial_design', industrialFooterProjects, ['Home', 'Resume', 'UX/UI', 'Recipes'], '/industrial_design'],
    ['/recipes', uxFooterProjects, ['Top', 'Resume', 'UX/UI', 'Design'], '/ux_ui'],
    ['/recipes', industrialFooterProjects, ['Top', 'Resume', 'UX/UI', 'Design'], '/industrial_design'],
])('footer on %s shows the correct projects and navigation', async (route, source, labels, mainRoute) => {
    window.history.replaceState(null, '', route);
    const branding = [{ id: 'brand', title: 'Brand guideline', pdfDirectory: 'Example', pageCount: 1 }];
    globalThis.fetch = jest.fn(async (url: unknown) => ({
        ok: true,
        json: async () => String(url).includes('/portfolio/')
            ? { projects: Object.fromEntries(['Spark', 'Obsidian', 'Vital', 'Batterola', 'Parallel']
                .map((name, index) => [String(index + 1), { name }])) }
            : branding,
    })) as unknown as typeof fetch;
    const scrollTop = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    await act(async () => root.render(
        <Footer currentRoute={route} mainRoute={mainRoute}
            resumeRoute={route === '/recipes' ? mainRoute : route}
            pages={footerPages} projectSource={source} />
    ));
    const sections = container.querySelectorAll('.footer-section');
    expect(Array.from(sections[3].querySelectorAll('a, button')).map(node => node.textContent)).toEqual(labels);
    const projectNames = Array.from(sections[0].querySelectorAll('a span')).map(node => node.textContent);
    expect(projectNames).toEqual(source === industrialFooterProjects
        ? ['Spark', 'Obsidian', 'Vital', 'Batterola', 'Parallel']
        : ['Parallel', 'Mission Control', 'Stockhub']);
    const parallel = Array.from(sections[0].querySelectorAll('img'))
        .find(img => img.alt === 'Parallel icon');
    expect(parallel?.getAttribute('src')).toBe('/assets/industrial_design/icons/project_icons/Parallel.svg');
    const resume = sections[3].querySelector('a');
    expect(resume?.getAttribute('href')).toBe((route === '/recipes' ? mainRoute : route) + '#resume-section');
    act(() => (sections[3].querySelector('button') as HTMLButtonElement).click());
    expect(scrollTop).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    act(() => (sections[1].querySelector('button') as HTMLButtonElement).click());
    expect(container.querySelector('[role="dialog"]')?.textContent).toBe('Brand guideline');
});
