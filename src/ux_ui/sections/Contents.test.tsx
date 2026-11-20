import React from 'react';
import { expect, test } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';
import Contents, { contentsCues, contentsEnd, contentsImages } from './Contents';

test('cuts each temporary image to the next column on its 48 fps cue', () => {
    expect(contentsImages(19 + 21 / 48)).toEqual([]);
    expect(contentsImages(19 + 22 / 48)).toEqual([1]);
    expect(contentsImages(20 + 10 / 48)).toEqual([1]);
    expect(contentsImages(20 + 11 / 48)).toEqual([2]);
    expect(contentsImages(21 + 1 / 48)).toEqual([3]);
    expect(contentsImages(21 + 38 / 48)).toEqual([4]);
    expect(contentsImages(22 + 6 / 48)).toEqual([4, 5]);
    expect(contentsImages(contentsEnd)).toEqual([4, 5, 6]);
    expect(contentsImages(60)).toEqual([4, 5, 6]);
});

test('preloads all images and only exposes final visible tiles as keyboard links', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<Contents time={contentsCues[0].start} />);
    expect(container.querySelectorAll('.ux-contents-art')).toHaveLength(6);
    expect(container.querySelectorAll('a[tabindex="0"]')).toHaveLength(0);
    container.innerHTML = renderToStaticMarkup(<Contents time={contentsEnd} />);
    expect(Array.from(container.querySelectorAll('a[tabindex="0"]')).map(link => link.getAttribute('href')))
        .toEqual(['#project-1', '#project-2', '#project-3']);
});

test('reveals all three logos together at frame 43 and keeps the final scene alive until then', () => {
    expect(contentsEnd).toBe(22 + 43 / 48);
    const before = renderToStaticMarkup(<Contents time={22 + 42 / 48} />);
    expect(before).not.toContain('has-logos');
    const after = renderToStaticMarkup(<Contents time={contentsEnd} />);
    expect(after).toContain('has-logos');
    const container = document.createElement('div');
    container.innerHTML = after;
    expect(Array.from(container.querySelectorAll('.ux-contents-brand img')).map(img => img.getAttribute('src')))
        .toEqual(['parallel', 'mission_control', 'stockhub'].map(logo => `/assets/ux_ui/hero/${logo}.png`));
});
