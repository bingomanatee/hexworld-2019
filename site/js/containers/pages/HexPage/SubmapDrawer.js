import propper from '@wonderlandlabs/propper';
import _ from 'lodash';
import SVG from 'svg.js';
import { Box2, Vector2 } from 'three';

import Perimeter from '../../../hexagon/Perimeter';
import Hexagon from '../../../hexagon/Hexagon';
import Extent from '../../../hexagon/Extent';

function pointsToPoly(points) {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

export default class SubmapDrawer {
  constructor(world, pointIndex) {
    this.pointIndex = pointIndex;
    this.world = world;
    this.initPoints();
  }

  update(world, pointIndex, svgRef) {
    pointIndex = pointIndex ? Number.parseInt(pointIndex, 10) : null;
    console.log('update:', world, pointIndex, svgRef);
    let reset = false;
    if (!(world.id === _.get(this, 'world.id'))) {
      reset = true;
      this.world = world;
    }
    if (!(pointIndex === this.pointIndex)) {
      this.pointIndex = pointIndex;
      reset = true;
    }
    const current = _.get(svgRef, 'current');
    if (current !== this.svg) {
      this.svg = current;
      reset = true;
    }
    if (reset) {
      this.reset();
    }
  }

  reset() {
    this.initPoints();
  }

  _extent(objs, dim) {
    const values = _.map(objs, dim);
    const extent = {
      min: _.min(values),
      max: _.max(values),
    };
    extent.range = extent.max - extent.min;
    return extent;
  }

  draw(ref, size) {
    if (!(ref && size)) {
      console.log('SubmapDrawer: missing ref, size');
      return;
    }
    const { width, height } = size;

    let draw;
    console.log('drawing submap');
    try {
      draw = new SVG(ref).size(width, height);
    } catch (err) {
      console.log('error creating svg: ', err);
      return;
    }

    try {
      this.initPoints();
    } catch (err) {
      console.log('error in initPoints: ', err);
      return;
    }

    console.log('referencePoints: ', this._referencePoints);
    const ext = new Extent(this._referencePoints).fitToBox(new Box2(new Vector2(), new Vector2(width, height)));

    const str = pointsToPoly(ext.list);
    console.log('rendering points', ext, str);
    draw.polygon(str).fill('yellow').stroke({ width: 10, color: 'red' });

    const hex = Hexagon.inBox(width, height);
    const hStr = pointsToPoly(hex.points);
    console.log('hex points: ', hStr);
    draw.polygon(hStr).fill('rgba(0,0,0,0.5)').stroke({ width: 10, color: 'blue' });
  }

  initPoints() {
    if (!(this.world && this.pointIndex)) {
      return;
    }

    this.perimiter = new Perimeter(this);
    const flat = this.perimiter.flatPoints;
    this._referencePoints = flat.map(({ x, y }) => new Vector2(x, y));
  }
}

propper(SubmapDrawer)
  .addProp('pointIndex', {
    onChange() {
      this.initPoints();
    },
  })
  .addProp('svg')
  .addProp('world', {
    type: 'object',
    required: false,
    onChange() {
      this.initPoints();
    },
  });
