import propper from '@wonderlandlabs/propper';
import _ from 'lodash';
import SVG from 'svg.js';
import { Box2, Vector2 } from 'three';
import Perimeter from '../../../hexagon/Perimeter';
import Hexagon from '../../../hexagon/Hexagon';
import Hexagons from '../../../hexagon/Hexagons';
import Extent from '../../../hexagon/Extent';

function pointsToPoly(points) {
  return points.map(({ x, y }) => `${Math.round(x)},${Math.round(y)}`)
    .join(' ');
}

class SubmapDrawer {
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
    this.size = size;
    console.log('setting svg to ', ref);
    this.svg = ref;
    const { width, height } = size;

    console.log('referencePoints: ', this._referencePoints);
    const ext = new Extent(this._referencePoints).fitToBox(new Box2(new Vector2(), new Vector2(width, height)));

    const str = pointsToPoly(ext.list);
    console.log('rendering points', ext, str);
    this.drawer.polygon(str)
      .fill('yellow')
      .stroke({
        width: 10,
        color: 'red',
      });

    const hex = Hexagon.inBox(width, height);
    hex.x += (width - hex.width) / 2;
    const hStr = pointsToPoly(hex.points);
    console.log('hex:', hex, 'width:', hex.width);
    const RADIUS = 20;
    this.drawer.polygon(hStr)
      .fill('rgba(0,0,0,0.5)')
      .stroke({
        width: 10,
        color: 'blue',
      });

    const scale = height / (2 * RADIUS);

    const hexes = new Hexagons(scale, RADIUS * 2, false);
    const center = hexes.getTile(RADIUS / 2 + 1, RADIUS / 2 + 4);
    console.log('scale---- ', scale, 'center:', center);

    let hir;
    try {
      hir = hexes.withinHex(RADIUS / 2, center);
    } catch (err) {
      console.log('error in withinHex:', err);
      return;
    }

    /*    const Hex = Honeycomb.extendHex({
      size: hex.scale / RADIUS,
      orientation: 'flat',
    });

    console.log('custom grid:', CustomGrid);
    const area = CustomGrid.rectangle(Hex({
      width: RADIUS * 2,
      height: RADIUS * 2,
      start: Hex(1 - RADIUS, 1 - RADIUS),
    }));
    // console.log('custom grid:', CustomGrid, 'area', area);

    const hir = area.hexesInRange(Hex(0, 0), RADIUS / 2);
    console.log('hexes;', hir); */

    hir.forEach((irhex) => {
      console.log('irhex:', irhex);
      console.log('points:', irhex.points);

      this.drawer.polygon(pointsToPoly(
        irhex.points,
      ))
        .stroke({
          width: 2,
          color: 'green',
        })
        .fill('rgba(0,0,0,0)');
    });
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
  .addProp('drawer')
  .addProp('svg', {
    onChange(ref, old) {
      console.log('svg change', ref, old);
      if (ref && ref !== old) {
        this.drawer = new SVG(ref);
        console.log('set draw for ', this);
        if (this.size) {
          this.drawer.size(this.size.width, this.size.height);
        }
      }
    },
  })
  .addProp('world', {
    type: 'object',
    required: false,
    onChange() {
      this.initPoints();
    },
  });

export default SubmapDrawer;
