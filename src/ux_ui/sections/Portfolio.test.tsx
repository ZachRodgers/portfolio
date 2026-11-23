import React, { act } from 'react';
import { expect, jest, test } from '@jest/globals';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import Contents, { contentsEnd } from './Contents';
import Portfolio from './Portfolio';

jest.mock('../content/portfolio/mission-control/MissionDemoFrame', () => () => <div className="demo-frame" />);
jest.mock('../../shared/components/CellRevealImage', () => () => <div />);

test('each project has a distinct landing section and Mission Control owns all of its content', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(<Portfolio />);
    const projects = Array.from(container.querySelectorAll('#portfolio > section'));
    expect(projects.map(project => project.id)).toEqual(['project-1', 'project-2', 'project-3']);
    const mission = projects[1];
    expect(mission.querySelector('.mission-project-hero')).not.toBeNull();
    expect(mission.querySelector('#mission-control-planning')).not.toBeNull();
    expect(mission.querySelector('#mission-control-browser-design')).not.toBeNull();
    expect(mission.querySelector('#mission-control-features')).not.toBeNull();
    expect(mission.querySelectorAll('.ux-framework-rule')).toHaveLength(1);
    expect(projects[2].contains(mission)).toBe(false);
});

test('hero contents smoothly scrolls to the selected project', () => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    const target = document.createElement('section');
    target.id = 'project-2';
    target.scrollIntoView = jest.fn();
    document.body.append(container, target);
    const root = createRoot(container);
    act(() => root.render(<Contents time={contentsEnd} />));
    act(() => (container.querySelector('a[href="#project-2"][tabindex="0"]') as HTMLAnchorElement).click());
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    act(() => root.unmount());
    container.remove();
    target.remove();
});
