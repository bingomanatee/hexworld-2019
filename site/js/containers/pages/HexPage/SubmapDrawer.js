import propper from '@wonderlandlabs/propper';
import _ from 'lodash';
import flatten from '@flatten-js/core';
import Perimeter from '../../../hexagon/Perimeter';
import Hexagon from '../../../hexagon/Hexagon';

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
    console.log('drawing submap');
    this.initPoints();
    const extentX = this._extent(this._referencePoints, 'x');
    const extentY = this._extent(this._referencePoints, 'y');
    const scalar = Math.min(size.width / extentX.range, size.height / extentY.range);
    const scaledPoints = this._referencePoints.map(({ x, y }) => ({
      y: (y - extentY.min) * scalar,
      x: (x - extentX.min) * scalar,
    }));

    const wideHex = Hexagon.fromPoints(this._referencePoints, size.width, size.height);
  }

  initPoints() {
    if (!(this.world && this.pointIndex)) {
      return;
    }

    this.perimiter = new Perimeter(this);
    const flat = this.perimiter.flatPoints;
    this._referencePoints = flat.map(({ x, y }) => ({
      x,
      y,
    }));
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
