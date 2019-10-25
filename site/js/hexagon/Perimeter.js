import propper from '@wonderlandlabs/propper';
import _ from 'lodash';
import { Triangle, Vector3, Object3D } from 'three';

export default class Perimeter {
  constructor(drawer) {
    this.drawer = drawer;
    this.computePoints();
  }

  get edges() {
    const verts = this.faces
      .map(({ a, b, c }, i) => ({
        points: [a, b, c],
        index: i,
      }))
      .filter((list) => list.points.includes(this.pointIndex));

    console.log('vertices:', verts);
    this._edges = verts.map(({ points }) => _.difference(points, [this.pointIndex]));
    console.log('edges:', this._edges);
    return this._edges;
  }

  get pointIndex() {
    return this.drawer.pointIndex;
  }

  computePoints() {
    this.vertices.forEach((v, i) => {
      v.i = i;
      v.s = v.toArray()
        .map((a) => Math.round(100 * a));
    });
    console.log('computing points for ', this.drawer, this.pointIndex, 'dpi:', this.drawer.pointIndex);

    let edges = [...this.edges];
    if (!edges.length) {
      console.log('no edges');
      return;
    }

    let points = edges.pop()
      .slice(0);

    let loops = 0;
    while (edges.length) {
      if (++loops > 20) return;
      const lastPoint = _.last(points);
      const nextEdgeI = _.findIndex(edges, (edge) => edge.includes(lastPoint));
      if (nextEdgeI !== -1) {
        const nextEdge = edges[nextEdgeI];
        points = _.uniq([...points, ...nextEdge]);
        edges = _.difference(edges, [nextEdge]);
      } else {
        break;
      }
    }
    console.log('point indexes: =========== >', points);

    const pointLinks = points.map((p, i) => [this.vertices[p], this.vertices[points[(i + 1) % points.length]]]);

    console.log('point links ===========>: ', pointLinks);
    const triangles = pointLinks.map(([a, b]) => new Triangle(a, b, this.point));

    this.points = triangles.map((t) => t.getMidpoint(new Vector3()));
    console.log('points: ', this.points);
  }

  get vertices() {
    return _.get(this, 'drawer.world.model.vertices', []);
  }

  get faces() {
    return _.get(this, 'drawer.world.model.faces', []);
  }

  get point() {
    return this.vertices[this.pointIndex];
  }

  get plane() {
    if (!this._plane) {
      const a = new Object3D();
      a.lookAt(this.point);
      a.updateMatrix();
      this._plane = new Object3D();
      a.attach(this._plane);
      this._plane.updateWorldMatrix();
    }
    return this._plane;
  }

  get flatPoints() {
    return this.points.map((point) => this.plane.worldToLocal(point.clone()));
  }

  get north() {
    return this.plane.worldToLocal(new Vector3(1, 0, 0));
  }
}

propper(Perimeter)
  .addProp('pointIndexes', {
    type: 'array',
    defaultValue: () => ([]),
  });
