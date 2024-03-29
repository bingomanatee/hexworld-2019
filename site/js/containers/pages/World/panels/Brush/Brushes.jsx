/* eslint-disable no-return-assign */
import {
  Text, RangeInput, Box, Button, CheckBox,
} from 'grommet';
import React, { Component } from 'react';
import _ from 'lodash';
import BrushGrid from './BrushGrid';
import SvgColorPip from './SvgColorPip';

export default class Brushes extends Component {
  constructor(props) {
    super(props);
    const { world } = props;
    this.state = {
      opacity: 0,
      radius: 0,
    };
  }

  componentDidUpdate() {
    const { world, opacity } = this.state;

    if (opacity === 0 && world) {
      this.setState({
        opacity: world.opacity,
        radius: world.radius,
      });
    }
  }

  componentDidMount() {
    if (this.state.world) {
      this.initState();
    }
  }

  render() {
    const { world } = this.props;
    if (!world) return '';
    const { opacity, radius } = this.state;
    console.log('world paint mode: ', world.paintMode);
    return (
      <BrushGrid world={world}>
        <Box gridArea="label-op">
          <Text size="small" weight="bold">Opacity</Text>
        </Box>
        <Box gridArea="control-op">
          <RangeInput
            onChange={(e) => {
              const opacity = _.get(e, 'target.value', 0.2);
              world.opacity = Number(opacity);
              this.setState({ opacity });
            }}
            min={0.1}
            max={0.8}
            value={world.opacity}
            step={0.05}
          />
        </Box>
        <Box gridArea="value-op">
          <Text size="small">{world.opacity}</Text>
        </Box>
        <Box gridArea="label-radius">
          <Text size="small" weight="bold">Radius</Text>
        </Box>
        <Box gridArea="control-radius">
          <RangeInput
            onChange={(e) => {
              const r = _.get(e, 'target.value', 0.5);
              console.log('radius change: ', e, r);
              world.radius = Number(r);
              this.setState({ radius: r });
            }}
            min={0.02}
            max={0.3}
            step={0.01}
            value={world.radius}
          />
        </Box>
        <Box gridArea="value-radius">
          <Text size="small">{world.radius}</Text>
        </Box>
        <Box gridArea="label-mode">
          <Text size="small" weight="bold">Mode</Text>
        </Box>
        <Box gridArea="control-mode" direction="row" alignContent="center" algin={"center"}>
          <Box margin="small"><CheckBox
            label={false}
            checked={world.paintMode}
            onChange={() => {
              world.paintMode = !world.paintMode;
              this.setState({ paintMode: world.paintMode });
            }}
            toggle="true"
          />
          </Box>
          <Text margin="small">{world.paintMode ? 'Paint' : 'Select'}</Text>
        </Box>
      </BrushGrid>
    );
  }
}
