import _ from 'lodash';
import Hexagons from './Hexagons';

const neighborPoints = (neighbors) => _(neighbors)
  .map('coords')
  .sortBy('x', 'y')
  .value();

describe('Hexagons', () => {
  it('should create a Hexagons instance', () => {
    const h = new Hexagons(10, 20, true);
    expect(h.pointy)
      .toBeTruthy();
  });

  it('should retrieve a tile', () => {
    const h = new Hexagons(10, 20, true);
    const t = h.getTile(2, 2);
    expect(t.position)
      .toEqual({
        x: 2,
        y: 2,
      });

    const t2 = h.getTile(3, 3);
    expect(t2.position)
      .toEqual({
        x: 3.5,
        y: 3,
      });
  });

  it('should have the expected corners', () => {
    const h = new Hexagons(10, 20, true);
    const t = h.getTile(0, 0);
    expect(t.pointsR.map(({ x, y }) => [x, y]))
      .toEqual([[9, 5], [0, 10], [-9, 5], [-9, -5], [-0, -10], [9, -5]]);

    const t2 = h.getTile(1, 0);
    expect(t2.pointsR.map(({ x, y }) => [x, y]))
      .toEqual([[17, 5], [9, 10], [0, 5], [-0, -5], [9, -10], [17, -5]]);

    const t3 = h.getTile(0, 1);
    expect(t3.pointsR.map(({ x, y }) => [x, y]))
      .toEqual([[9, 15], [0, 20], [-9, 15], [-9, 5], [-0, 0], [9, 5]]);
  });

  it('should have the expected cube coords', () => {
    const h = new Hexagons(10, 20, true);

    const tile = h.getTile(0, 0);

    expect(tile.cube)
      .toEqual({
        q: 0,
        r: 0,
        s: 0,
      });

    const tile2 = h.getTile(0, 2);

    expect(tile2.cube)
      .toEqual({
        q: 2,
        r: 0,
        s: -2,
      });

    const tile3 = h.getTile(2, 2);

    expect(tile3.cube)
      .toEqual({
        q: 1,
        r: 2,
        s: -3,
      });
  });

  describe('distance', () => {
    it('should retrieve neighbors with rad = 1', () => {
      const h = new Hexagons(10, 20, true);
      const neighbors = h.within(1, 0, 0);
      console.log('neighbors: ', neighbors);
      expect(_.isEqual(
        neighborPoints(neighbors),
        [{
          x: 0,
          y: 0,
        }, {
          x: 0,
          y: 1,
        }, {
          x: 1,
          y: 0,
        }],
      ))
        .toBeTruthy();
      // console.log('neighbors', neighbors);

      const innerNeighbors = h.within(2, 3, 5);
      const np = neighborPoints(innerNeighbors);

      expect(_.isEqual(np,
        [{ x: 1, y: 5 },
          { x: 2, y: 3 },
          { x: 2, y: 4 },
          { x: 2, y: 5 },
          { x: 2, y: 6 },
          { x: 2, y: 7 },
          { x: 3, y: 3 },
          { x: 3, y: 4 },
          { x: 3, y: 5 },
          { x: 3, y: 6 },
          { x: 3, y: 7 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 4, y: 5 },
          { x: 4, y: 6 },
          { x: 4, y: 7 },
          { x: 5, y: 4 },
          { x: 5, y: 5 },
          { x: 5, y: 6 }]))
        .toBeTruthy();
    });
  });
});
