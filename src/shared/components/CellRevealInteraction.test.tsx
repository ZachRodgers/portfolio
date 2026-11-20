import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, jest, test } from '@jest/globals';
import CellRevealImage from './CellRevealImage';

test('enables hover one second after the loaded image finishes revealing and disables it on exit', () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false }) });
    const canvas = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
        act(() => root.render(<CellRevealImage src="/example.png" visible revealProgress={.4} />));
        act(() => container.querySelector('img')!.dispatchEvent(new Event('load')));
        act(() => jest.advanceTimersByTime(1500));
        expect(container.querySelector('.cell-reveal-ready')).toBeNull();
        act(() => root.render(<CellRevealImage src="/example.png" visible revealProgress={1} />));
        act(() => jest.advanceTimersByTime(999));
        expect(container.querySelector('.cell-reveal-ready')).toBeNull();
        act(() => jest.advanceTimersByTime(1));
        expect(container.querySelector('.cell-reveal-ready')).not.toBeNull();
        act(() => root.render(<CellRevealImage src="/example.png" visible revealProgress={1} exitProgress={.1} />));
        expect(container.querySelector('.cell-reveal-ready')).toBeNull();
    } finally {
        act(() => root.unmount());
        canvas.mockRestore();
        jest.useRealTimers();
    }
});
