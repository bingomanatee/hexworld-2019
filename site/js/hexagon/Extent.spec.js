import { Box2, Vector2 } from 'three';

import Extent from './Extent.js';

describe('Extent', () => {
  const points = [{ x: 10, y: 0 }, { x: -5, y: 20 }, { x: 100, y: 2 }];
  const e = new Extent(points);
  describe('dim', () => {
    it('should find the range of points', () => {
      const dim = e.dim('x');

      expect(dim.min).toBe(-5);
      expect(dim.max).toBe(100);
      expect(dim.mid).toBe(47.5);
    });
  });

  describe('center', () => {
    it('should find center', () => {
      expect(e.center.x).toBe(47.5);
      expect(e.center.y).toBe(10);
    });
  });

  describe('toBox', () => {
    const trapBox = new Extent([{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 2 }]);

    it('should have the right points', () => {
      const boxedPoints = trapBox.fitToBox(new Box2(new Vector2(-30, -30), new Vector2(30, 30)));
      expect(boxedPoints.list.map((n) => n.toArray())).toEqual([[-30, -30], [10, -30], [30, -10], [-10, -10]]);
    });
  });
});
