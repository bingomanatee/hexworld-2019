import { IcosahedronGeometry } from 'three';
import propper from '@wonderlandlabs/propper';
import Voronoi from 'voronoi';
import _ from 'lodash';
import Svg from 'svg.js';
import colorJS from 'chroma-js';
import Polygon from './Polygon';
import WorldPoint from './WorldPoint';

import worldStore from '../store/worlds.store';

function loopToPolyPoints(loop) {
  loop.push(_.first(loop));
  return loop.map(({ x, y }) => `${Math.round(x)},${Math.round(y)}`)
    .join(' ');
}

export default class World {
  constructor(name, resolution = 0, heights = null, id = '') {
    this.name = name;
    this.resolution = resolution;
    this.id = id;
    this.init(heights);
    this.paint = _.throttle((n, e) => this._paint(n, e), 100);
    this.save = _.throttle((...args) => this._save(...args), 2000, { trailing: true });
    console.log('new world: ', this);
  }

  _paint(n) {
    const worldPoint = this.points.get(n);
    if (worldPoint) {
      const height = this.elevationHeight;
      this.points.forEach((otherWP) => {
        if (otherWP.vertex.manhattanDistanceTo(worldPoint.vertex) < 2 * (this.radius)) {
          otherWP.addHeight(height, worldPoint.vertex, this.radius, this.opacity);
        }
      });
      this.updateHeights();
      this.save();
    } else {
      console.log('cannot find point ', n);
    }
  }

  _save() {
    worldStore.actions.save(this);
  }

  updateHeights() {
    this.points.forEach((point) => {
      const { pointIndex, height } = point;
      console.log('updating height ', pointIndex, height, 'from ', point);
      this.heights.set(pointIndex, height);
    });
  }

  get elevationHeight() {
    return this.elevations.reduce((match, candidate) => {
      if (match) {
        return match;
      }
      if (candidate.name === this.currentElevation) {
        return candidate;
      }
      return null;
    }, null).height;
  }

  init(heights) {
    this.model = new IcosahedronGeometry(1, this.resolution);
    this.elevations.push({
      height: 20000,
      shade: 1,
      color: [255, 255, 255],
      name: 'top',
    });
    this.elevations.push({
      height: 10000,
      shade: 1,
      color: [102, 0, 51],
      name: 'treeline',
    });
    this.elevations.push({
      height: 5000,
      shade: 0.8,
      color: [51, 102, 0],
      name: 'mountains',
    });
    this.elevations.push({
      height: 200,
      shade: 0.6,
      color: [102, 153, 0],
      name: 'hills',
    });
    this.elevations.push({
      height: 0,
      shade: 0.5,
      color: [255, 255, 0],
      name: 'coast',
    });
    this.elevations.push({
      height: -1,
      shade: 0.5,
      color: [0, 13, 255],
      name: 'sea level',
    });
    this.elevations.push({
      height: -10000,
      shade: 0,
      color: [0, 0, 0],
      name: 'bottom',
    });

    if (heights && Array.isArray(heights)) {
      heights.forEach(([value, index]) => {
        this.heights.set(index, value);
      });
    }
  }

  drawSVG(svgRef) {
    this.svgRef = svgRef;
    this.draw2D();
  }

  refresh() {
    worldStore.actions.updateWorld(this);
  }

  eleToColor(height) {
    if (!_.isNumber(height)) {
      return '#999999';
    }
    const range = {
      prev: _.first(this.sortedElevations),
      match: null,
      next: _.last(this.sortedElevations),
    };

    try {
      if (height < range.prev.height) {
        return colorJS(...range.prev.color)
          .css();
      }
      if (height > range.next.height) {
        return colorJS(...range.next.color)
          .css();
      }
    } catch (err) {
      console.log('error -- eleToColor extremes', err);
      return '#999999';
    }

    try {
      this.elevations.forEach((ele) => {
        if (!range.match) {
          if (ele.height < range.prev.height
            || ele.height > range.next.height) {
            return;
          }
          if (ele.height < height) {
            if (ele.height > range.prev.height) {
              range.prev = ele;
            }
          } else if (ele.height === height) {
            range.match = ele;
          } else if (ele.height < range.next.height) {
            range.next = ele;
          }
        }
      });
    } catch (err) {
      console.log('error- eleToColor - iter', err);
      return '#999999';
    }

    try {
      if (range.match) {
        return colorJS(...range.match.color)
          .css();
      }
    } catch (err) {
      console.log('error- eleToColor - match', err);
      return '#999999';
    }
    try {
      const prevColor = colorJS(...range.prev.color);
      const nextColor = colorJS(...range.next.color);
      const diff = range.next.height - range.prev.height;
      const extent = height - range.prev.height;
      return colorJS.mix(prevColor, nextColor, extent / diff)
        .css();
    } catch (err) {
      console.log('error- eleToColor - mix', err);
      return '#999999';
    }
  }

  setActiveElevation(ele, e) {
    if (e) {
      e.preventDefault();
    }
    if (_.isObject(ele)) {
      if ('name' in ele) {
        this.setActiveElevation(ele.name);
      }
    } else {
      console.log('setting current elevation', ele);
      this.currentElevation = ele;
      this.refresh();
    }
  }

  areas() {
    const areas = [
      {
        name: 'label-head',
        start: [0, 0],
        end: [1, 0],
      },
      {
        name: 'value-head',
        start: [2, 0],
        end: [3, 0],
      },
    ];
    this.sortedElevations.forEach((e, i) => {
      areas.push({
        name: `pip-${i}`,
        start: [0, i + 1],
        end: [0, i + 1],
      });
      areas.push({
        name: `label-${i}`,
        start: [1, i + 1],
        end: [1, i + 1],
      });
      areas.push({
        name: `value-${i}`,
        start: [2, i + 1],
        end: [2, i + 1],
      });
    });
    return areas;
  }

  get sortedElevations() {
    return _.sortBy(this.elevations, 'height');
  }

  draw2D(svgRef, size) {
    if (svgRef) {
      this.svgRef = svgRef;
    }
    if (size) {
      this.size2D = size;
    }

    const svgElement = _.get(this, 'svgRef.current');

    if (this.size2D && svgElement) {
      const xr = _.get(this, 'size2D.width', 0);
      const yb = _.get(this, 'size2D.height', 0);

      const bbox = {
        xl: 0,
        xr,
        yt: 0,
        yb,
      }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

      const points2D = this.model.vertices.map((vertex, i) => {
        // @todo - put to worldPoint
        const { x, y, z } = vertex;
        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const lng = (Math.atan2(y, x) + Math.PI) % (Math.PI * 2);
        const x2D = lng / (Math.PI * 2);
        const y2D = (lat + Math.PI / 2) / (Math.PI);
        return new WorldPoint({
          xi: x2D.toFixed(2),
          yi: y2D.toFixed(2),
          lat,
          lng,
          world: this,
          vertex,
          x: Math.round(x2D * xr),
          y: Math.round(y2D * yb),
          pointIndex: i,
        });
      });

      points2D.forEach((point) => {
        this.points.set(point.pointIndex, point);
        if (!this.heights.has(point.pointIndex)) {
          this.heights.set(point.pointIndex, -100);
        }
      });

      const diagram = new Voronoi().compute(points2D, bbox);
      const draw = new Svg(svgElement).size(xr, yb);
      diagram.cells.forEach((cell) => {
        if (_.get(cell, 'halfedges.length') > 2) {
          try {
            const worldPointIndex = cell.site.pointIndex;
            const worldPoint = this.points.get(worldPointIndex);

            const edges = _(cell.halfedges)
              .map('edge')
              .map(({ va, vb }) => [va, vb])
              .value();
            const poly = new Polygon(edges);
            const polyPoints = loopToPolyPoints(poly.loop());
            const index = cell.site.pointIndex;
            const drawnPoly = draw.polygon(polyPoints)
              .stroke({
                width: 1,
                color: 'black',
              })
              .attr({ id: `shape-for-point-${index}` });
            worldPoint.poly = drawnPoly;
          } catch (err) {
            console.log('error drawing', err);
          }
        }
      });
    }
  }

  toJSON() {
    const info = {
      name: this.name,
      resolution: this.resolution,
    };
    const data = Array.from(this.heights.entries());

    return {
      info,
      data,
      id: this.id || '',
    };
  }
}

propper(World)
  .addProp('svgRef')
  .addProp('id', '')
  .addProp('opacity', {
    defaultValue: 0.5,
    onChange(value) {
      console.log('opacity set to ', value);
    },
  })
  .addProp('radius', {
    defaultValue: 0.1,
  })
  .addProp('name', {
    type: 'string',
    defaultValue: '',
  })
  .addProp('points', {
    defaultValue: () => new Map(),
  })
  .addProp('heights', {
    defaultValue: () => new Map(),
  })
  .addProp('size2d', () => ({}), 'object')
  .addProp('model')
  .addProp('elevations', {
    type: 'array',
    defaultValue: () => [],
  })
  .addProp('currentElevation', {
    defaultValue: 'hills',
    type: 'string',
  })
  .addProp('resolution', {
    type: 'integer',
    defaultValue: 0,
  });
