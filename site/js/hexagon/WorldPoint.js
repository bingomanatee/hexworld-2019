
import propper from '@wonderlandlabs/propper';
import _ from 'lodash';

export default class WorldPoint {
  constructor(props) {
    Object.assign(this, props);
    if (this.world.heights.has(this.pointIndex)) {
      this.height = this.world.heights.get(this.pointIndex);
    }
  }

  shadeToColor() {
    if (this.poly) {
      console.log('shadeToColor filling');
      const height = _.clamp(this.height, -20000, 20000);
      const color = this.world.eleToColor(height);
      if (height !== -100) {
        console.log('height: ', height, 'color: ', color);
      }
      this.poly.fill(color);
    }
  }

  addHeight(height, center, radius, opacity, checked) {
    const distance = this.vertex.distanceTo(center);
    if (distance < radius) {
      const attrition = (distance < radius / 4) ? 1 : 1 - (distance / radius);
      const changeAmount = opacity * attrition;
      this.height = this.height * (1 - changeAmount) + height * changeAmount;
      return true;
    }
    return false;
  }

  get height() {
    if (!this.world.heights.has(this.pointIndex)) return 0;
    return this.world.heights.get(this.pointIndex);
  }

  set height(value) {
    this.world.heights.set(this.pointIndex, value);
    this.shadeToColor();
  }
}


propper(WorldPoint)
  .addProp('pointIndex', {
    type: 'integer',
    required: 'true',
  })
  .addProp('lat', { type: 'number' })
  .addProp('lng', { type: 'number' })
  .addProp('point', {
    type: 'object',
  })
  .addProp('world', {
    type: 'object',
  })
  .addProp('poly', {
    type: 'object',
    onChange(value, old) {
      if (value) {
        this.shadeToColor();
        value.mousemove((e) => {
          if (e.buttons === 1) {
            this.world.paint(this.pointIndex, e);
          }
        });
      }
    },
  })
  .addProp('vertex', () => ({ x: 0, y: 0, z: 0 }), 'object')
  .addProp('x', {
    type: 'number',
    required: 'true',
  })
  .addProp('y', {
    type: 'number',
    required: 'true',
  });
