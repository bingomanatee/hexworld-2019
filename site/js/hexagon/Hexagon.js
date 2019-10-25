import propper from '@wonderlandlabs/propper';
import { Vector2 } from 'three';
import _ from 'lodash';
import Extent from './Extent';

class Hexagon {
  constructor({
    x, y, pointy, scale,
  }) {
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    this.pointy = !!pointy;
  }
}

const W_H_RATIO = Math.cos(Math.PI / 3);

Hexagon.inBox = (right, top, pointy = true, left = 0, bottom = 0) => {
  const height = top - bottom;
  let x = (top + bottom) / 2;
  let y = (right + left) / 2;
  const hr = height / 2;
  const width = right - left;
  const wr = width / 2;

  let scale = hr;

  if (pointy) {
    if (hr * W_H_RATIO > wr) {
      scale = wr;
    }
  } else if (wr * W_H_RATIO > hr) {
    scale = wr;
  }
  x *= scale;
  y *= scale;
  return new Hexagon({
    x,
    y,
    pointy,
    scale,
  });
};

Hexagon.fromPoints = (points, box) => {
  const e = new Extent(points);
  const e2 = e.fitToBox(box);
  const pointy = e2.dim('x').range < e2.dim('y').range;
};

const rad60 = Math.PI / 3;
const rad30 = Math.PI / 6;

const unitPointyHex = _.range(0, 6)
  .map((a) => new Vector2(
    Math.cos(rad30 + a * rad60),
    Math.sin(rad30 + a * rad60),
  ));
const unitHex = _.range(0, 6)
  .map((a) => new Vector2(
    Math.cos(a * rad60),
    Math.sin(a * rad60),
  ));

propper(Hexagon)
  .addProp('x', {
    type: 'integer',
    defaultValue: 0,
  })
  .addProp('y', {
    type: 'integer',
    defaultValue: 0,
  })
  .addProp('scale', {
    type: 'float',
    defaultValue: 1,
  })
  .addProp('pointy', {
    type: 'boolean',
    defaultValue: true,
  })
  .addProp('grid');


export default Hexagon;
