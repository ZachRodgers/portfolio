import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import useHashScroll from './useHashScroll';

let root: Root;
let container: HTMLDivElement;
let scroll: ReturnType<typeof jest.fn>;

function Page() {
    useHashScroll();
    return null;
}

beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    scroll = jest.fn();
    HTMLElement.prototype.scrollIntoView = scroll;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
        callback(0);
        return 1;
    });
});

afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
    window.history.replaceState(null, '', '/');
    jest.restoreAllMocks();
});

test('scrolls to a section mounted after the initial JSON request', async () => {
    window.history.replaceState(null, '', '/ux_ui#resume-section');
    act(() => root.render(<Page />));
    expect(scroll).not.toHaveBeenCalled();
    const section = document.createElement('section');
    section.id = 'resume-section';
    document.body.appendChild(section);
    await act(async () => { await Promise.resolve(); });
    expect(scroll).toHaveBeenCalledTimes(1);
});

test('responds to hash changes and decodes section IDs', () => {
    const section = document.createElement('section');
    section.id = 'User research';
    document.body.appendChild(section);
    act(() => root.render(<Page />));
    act(() => {
        window.history.replaceState(null, '', '/ux_ui#User%20research');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(scroll).toHaveBeenCalledTimes(1);
});

test('ignores malformed hashes', () => {
    window.history.replaceState(null, '', '/ux_ui#%invalid');
    expect(() => act(() => root.render(<Page />))).not.toThrow();
    expect(scroll).not.toHaveBeenCalled();
});
