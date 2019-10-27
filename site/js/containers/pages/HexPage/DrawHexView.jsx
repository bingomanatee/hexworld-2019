import React, { PureComponent } from 'react';
import { Box, DataTable } from 'grommet';
import _ from 'lodash';
import { withSize } from 'react-sizeme';
import SubmapDrawer from './SubmapDrawer';

const scalePoint = (a) => Math.round(100 * a);

const VERT_COLUMNS = [
  {
    property: 'i',
    header: 'Index',
    primary: 'true',
  },
  { property: 'x', header: 'X', render: ({ x }) => scalePoint(x) },
  { property: 'y', header: 'Y', render: ({ y }) => scalePoint(y) },
  { property: 'z', header: 'Z', render: ({ z }) => scalePoint(z) },
];

export default withSize({
  monitorWidth: true,
  monitorHeight: true,
})(
  class DrawHexView extends PureComponent {
    constructor(props) {
      super(props);
      this.svgRef = React.createRef();
      const { world, pointIndex } = props;
      if (world && pointIndex) {
        this.submapDrawer = new SubmapDrawer(world, Number.parseInt(pointIndex, 10));
      }
    }

    componentDidMount() {
      this.draw();
    }

    componentDidUpdate() {
      const { world, pointIndex } = this.props;
      if (world && pointIndex) {
        this.submapDrawer = new SubmapDrawer(world, Number.parseInt(pointIndex, 10));
      }
      this.draw();
    }

    draw() {
      console.log('DrawHexView: drawing with ', this.svgRef);
      const current = _.get(this, 'svgRef.current');
      if (!current) return;
      this.submapDrawer.draw(current, this.props.size);
    }

    _data() {
      const { size, world } = this.props;
      const data = _.get(world, 'model.vertices', []);
      const dataF = _.get(world, 'model.faces', []);

      function drawPoint(index) {
        const p = _.get(world, `model.vertices.${index}`);
        if (!p) return '--';
        return `${index}: ${p.toArray().map(scalePoint).join(',')}`;
      }

      const FACE_COLUMNS = [
        {
          property: 'i',
          header: 'Index',
          primary: 'true',
        },
        { property: 'a', header: 'A', render: ({ a }) => drawPoint(a) },
        { property: 'b', header: 'B', render: ({ b }) => drawPoint(b) },
        { property: 'c', header: 'C', render: ({ c }) => drawPoint(c) },
      ];
      return (
        <Box fill id="map" direction="row">
          <Box style={({ overflow: 'scroll' })}>
            <h2>Verts</h2>
            <DataTable
              step={2000}
              data={data.map((p, i) => ({
                i, x: p.x, y: p.y, z: p.z,
              }))}
              columns={VERT_COLUMNS}
            />
          </Box>
          <Box style={({ overflow: 'scroll' })}>
            <h2>Faces</h2>
            <DataTable
              step={2000}
              data={dataF.map((p, i) => ({
                ...p, i,
              }))}
              columns={FACE_COLUMNS}
            />
          </Box>
        </Box>
      );
    }

    render() {
      return (
        <Box fill>
          <svg ref={this.svgRef} />
        </Box>
      );
    }
  },
);

//          <svg ref={this.svgRef} width={size.width} height={size.height} />
