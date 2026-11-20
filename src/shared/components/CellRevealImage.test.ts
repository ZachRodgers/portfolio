import { expect, test } from '@jest/globals';
import { squareCells } from './CellRevealImage';

test('uses eight square cells across with enough rows to cover any frame', () => {
    for (const [width, height] of [[400, 630], [127, 540], [240, 300]]) {
        const cells = squareCells(width, height);
        expect(cells.slice(0, 8).map(cell => cell.x)).toEqual(Array.from({ length: 8 }, (_, index) => index * width / 8));
        expect(cells.every(cell => cell.size === width / 8)).toBe(true);
        const last = cells[cells.length - 1];
        expect(last.y + last.size).toBeGreaterThanOrEqual(height);
        expect(cells.every(cell => cell.order >= 0 && cell.order < 1)).toBe(true);
        expect(new Set(cells.slice(0, 8).map(cell => cell.order)).size).toBe(8);
    }
});
