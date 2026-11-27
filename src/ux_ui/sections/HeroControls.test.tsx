import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import Hero from './Hero';

jest.mock('../../shared/voice-orb/components/VoiceOrb', () => () => null);

let container: HTMLDivElement;
let root: Root;
let audio: HTMLAudioElement;

beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false }) });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    audio = document.createElement('audio');
    jest.spyOn(audio, 'pause').mockImplementation(() => {});
    act(() => root.render(<Hero audioElement={audio} failed={false} />));
    act(() => jest.advanceTimersByTime(500));
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.restoreAllMocks();
    jest.useRealTimers();
});

function click(selector: string) {
    act(() => container.querySelector<HTMLButtonElement>(selector)!.click());
}

test('replaces the arrow with an accessible start area and skips directly to the final contents', () => {
    const play = jest.spyOn(audio, 'play').mockResolvedValue(undefined);
    expect(container.querySelector('.ux-start-prompt')?.textContent).toBe('Click me');
    expect(container.querySelector('.ux-play-arrow')).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    click('.ux-skip');
    expect(play).not.toHaveBeenCalled();
    expect(audio.pause).toHaveBeenCalled();
    expect(container.querySelectorAll('.ux-contents-tile.is-visible.is-final')).toHaveLength(0);
    act(() => jest.advanceTimersByTime(480));
    expect(container.querySelectorAll('.ux-contents-tile.is-visible.is-final')).toHaveLength(1);
    act(() => jest.advanceTimersByTime(480));
    expect(container.querySelectorAll('.ux-contents-tile.is-visible.is-final')).toHaveLength(2);
    act(() => jest.advanceTimersByTime(480));
    expect(container.querySelectorAll('.ux-contents-tile.is-visible.is-final')).toHaveLength(3);
    expect(container.querySelector('.ux-contents.has-logos')).not.toBeNull();
    expect(container.querySelector('.ux-role-name')?.textContent).toBe('Zach Rodgers');
    expect(container.querySelector('.ux-skip')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
    act(() => jest.advanceTimersByTime(16));
    expect(document.activeElement).toBe(container.querySelector('#contents a[tabindex="0"]'));
});

test('clicking the orb area requests sound and skipping prevents a pending start from rewinding the scene', async () => {
    let finishPlay!: () => void;
    const play = jest.spyOn(audio, 'play').mockImplementation(() => new Promise<void>(resolve => { finishPlay = resolve; }));
    click('.ux-start-area');
    expect(play).toHaveBeenCalledTimes(1);
    expect(audio.muted).toBe(false);
    click('.ux-skip');
    await act(async () => finishPlay());
    act(() => jest.advanceTimersByTime(15000));
    expect(play).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('.ux-contents-tile.is-visible.is-final')).toHaveLength(3);
    expect(container.querySelector('.ux-contents.has-logos')).not.toBeNull();
    expect(container.querySelector('.ux-orb')).toBeNull();
});

test('replay resets a skipped final scene and restarts the soundtrack and animation', async () => {
    const play = jest.spyOn(audio, 'play').mockResolvedValue(undefined);
    expect(container.querySelector('.ux-replay')).toBeNull();
    click('.ux-skip');
    act(() => jest.advanceTimersByTime(1600));
    expect(container.querySelector('.ux-replay')).not.toBeNull();
    audio.currentTime = 23;
    click('.ux-replay');
    await act(async () => {});
    expect(play).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0);
    expect(audio.muted).toBe(false);
    expect(container.querySelector('.ux-orb')).not.toBeNull();
    expect(container.querySelector('.ux-replay')).toBeNull();
    expect(container.querySelectorAll('.ux-contents-tile.is-visible')).toHaveLength(0);
    act(() => { audio.currentTime = 5; jest.advanceTimersByTime(32); });
    expect(container.querySelector('.ux-text-reveal')?.textContent).toContain('Then');
});
