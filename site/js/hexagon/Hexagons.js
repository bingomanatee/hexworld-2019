/* eslint-disable camelcase,no-param-reassign */
import propper from '@wonderlandlabs/propper';
import _ from 'lodash';
import HexGrid from 'hex-grid.js';
import uuid from 'uuid/v4';
import Hexagon, { W_H_RATIO } from './Hexagon';
import {
  ODD, roffset_to_cube, roffset_from_cube, hex_round, hex_lerp,
} from './hexFn';

function pointy_hex_to_pixel(hex, size = 1) {
  const x = size * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
  const y = size * (3.0 / 2) * hex.r;
  return {
    x,
    y,
  };
}

function flat_hex_to_pixel(hex, size) {
  const x = size * (3.0 / 2) * hex.q;
  const y = size * (Math.sqrt(3) / 2) * hex.q + (Math.sqrt(3) * hex.r);
  return {
    x,
    y,
  };
}

/*
function s({ id, cube, coords }) {
  if (!cube) return `hex ${id}`;
  return `hex ${id} --- cube ${JSON.stringify(cube)} --- coords ${JSON.stringify(coords)}`;
}
*/

class Hexagons {
  constructor(scale, extent, pointy) {
    this.scale = scale;
    this.pointy = pointy;
    this.layout = pointy ? 'odd-r' : 'odd-q';
    this.grid = new HexGrid({
      width: extent,
      height: extent,
      orientation: (pointy ? 'pointy-topped' : 'flat-topped'),
      tileFactory: this,
      layout: this.layout,
    });
  }

  newTile() {
    const out = Object.assign(new Hexagon({
      x: 0,
      y: 0,
      pointy: this.pointy,
      scale: this.scale,
    }), { id: uuid() });
    return out;
  }

  getTile(i, j) {
    const tile = this.grid.getTileByCoords(i, j);
    return this.process(tile);
  }

  centerTile() {
    return this.getTile(0, 0);
  }

  process(tile) {
    if ((!tile) || tile.cube) return tile;
    const coords = this.grid.getCoordsById(tile.id);
    const { x, y } = coords;
    tile.coords = coords;
    tile.rc = {
      row: x,
      col: y,
    };
    tile.position = this.grid.getPositionById(tile.id);
    if (this.pointy) {
      tile.x = W_H_RATIO * x * this.scale * 2;
      tile.y = y * this.scale * 2;
    } else {
      throw new Error('write more code');
    }
    tile.cube = roffset_to_cube(ODD, tile.rc);

    const pixel = this.pointy ? pointy_hex_to_pixel(tile.cube) : flat_hex_to_pixel(tile.cube);
    tile.x = pixel.x * this.scale;
    tile.y = pixel.y * this.scale;
    return tile;
  }

  distance(a, b, max) {
    if (!(a && b)) {
      throw new Error('distance value missing');
    }

    if (max) {
      const minDistance = 'qrs'.split('')
        .reduce((dist, dim) => {
          const dimDist = Math.abs(a.cube[dim] - b.cube[dim]);
          return Math.max(dimDist, dist);
        }, 0);
      if (minDistance > max) return false;
    }

    if (a.id === b.id) return 0;
    const aNeighbors = this.grid.getNeighboursById(a.id);
    if (aNeighbors.includes(b)) {
      return 1;
    }
    const bNeighbors = this.grid.getNeighboursById(b.id);
    if (_.intersection(bNeighbors, aNeighbors).length) {
      return 2;
    }

    const midPoint = hex_round(hex_lerp(a.cube, b.cube, 0.5));
    const { col, row } = roffset_from_cube(ODD, midPoint);
    const hex = this.getTile(row, col);

    return this.distance(a, hex) + this.distance(b, hex);
  }

  within(n, center, y) {
    if (_.isNumber(center)) {
      center = this.getTile(center, y);
    }

    if (!center) {
      throw new Error('bad center');
    }
    const out = [];
    const iter = this.grid.getTileIterator();

    while (!iter.done) {
      const t = this.process(iter.next());
      if (!t) break;

      const dist = this.distance(t, center, n + 1);
      if ((dist !== false) && (dist <= n)) {
        out.push(t);
      }
    }

    return out;
  }
}

propper(Hexagons)
  .addProp('scale', {
    type: 'number',
    defaultValue: 1,
  })
  .addProp('pointy', {
    type: 'boolean',
    defaultValue: true,
  })
  .addProp('size', {
    type: 'number',
  });

export default Hexagons;
