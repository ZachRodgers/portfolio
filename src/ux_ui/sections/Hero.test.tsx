import { expect, jest, test } from '@jest/globals';
import { introText } from './Hero';

jest.mock('../../shared/voice-orb/components/VoiceOrb', () => () => null);

test('reveals from the left at a natural cadence and completes before erasing', () => {
    expect(introText(0)).toBe('');
    expect(introText(.08)).toBe('F');
    const partial = introText(.75);
    expect(partial.length).toBeLessThan(15);
    expect('First there was engineering...'.startsWith(partial)).toBe(true);
    expect(introText(2)).toBe('First there was engineering...');
    expect(introText(3.14)).toBe('');
    expect(introText(5.9)).toBe('Then there was design...');
    expect(introText(6.25)).toBe('Then there was design...');
    expect(introText(6.49)).toBe('Then there was design...');
    expect(introText(6.75)).toBe('');
});

test('delays the last phrase while preserving the final cue', () => {
    expect(introText(7)).toBe('The');
    expect(introText(8.99)).toBe('The world changed with');
    expect(introText(9)).toBe('The world changed with A');
    expect(introText(9.30)).toBe('The world changed with A');
    expect(introText(9.32)).toBe('The world changed with AI');
    expect(introText(10)).toBe('The world changed with AI');
});
