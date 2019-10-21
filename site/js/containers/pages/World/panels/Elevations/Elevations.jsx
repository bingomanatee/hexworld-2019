/* eslint-disable no-return-assign */
import {
  Text, TextInput, Box, Button,
} from 'grommet';
import React, { Component } from 'react';
import _ from 'lodash';
import ElevationGrid from './ElevationGrid';
import SvgColorPip from './SvgColorPip';

export default class Elevations extends Component {
  constructor(props) {
    super(props);
    this.state = { activeElevation: false, world: false };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.world && this.props.world) {
      this.setState({ activeElevation: this.props.world.activeElevation });
    }
  }

  render() {
    const { world } = this.props;

    if (!world) return '';

    return (
      <ElevationGrid world={world}>
        {world.elevations.map((elevation, i) => (
          <>
            <Box
              direction="row"
              key={`pip-${i}`}
              gridArea={`pip-${i}`}
              margin="0"
              pad="0"
              onClick={(e) => {
                world.setActiveElevation(elevation);
                this.setState({ activeElevation: elevation });
                console.log('active elevation:', elevation);
              }}
            >
              <span style={({ color: `rgb(${elevation.color.join(',')})` })}>
                <SvgColorPip active={elevation.name === world.currentElevation} />
              </span>
            </Box>
            <Box
              direction="row"
              key={`label-${i}`}
              gridArea={`label-${i}`}
              margin="3px 0"
              align="center"
              onClick={(e) => world.setActiveElevation(elevation, e)}
            >
              <Text size="small" weight="bold" truncate break="keep-all">{elevation.name}</Text>
            </Box>
            <Box
              key={`value-${i}`}
              gridArea={`value-${i}`}
              border={({ width: 2, color: 'neutral-4', radius: '5px' })}
              margin="3px 0"
              pad="2px"
              direction="row"
              justify="end"
              align="center"
              onClick={(e) => world.setActiveElevation(elevation, e)}
            >
              <Text size="small" align="right">{elevation.height}</Text>
            </Box>
          </>
        ))}
      </ElevationGrid>
    );
  }
}
