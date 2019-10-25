import React, { Component } from 'react';
import { Box, Button, Text } from 'grommet';
import DrawHexView from './DrawHexView';
// import worldState from '../../../store/worlds.store';

export default class DrawHex extends Component {
  render() {
    const { world, pointIndex } = this.props;
    if (!world) {
      return (
        <Box direction="column" alignContent="center" align="center" style={({ height: '100%' })}>
          <Text>Loading....</Text>
        </Box>
      );
    }
    return (
      <Box direction="column" alignContent="stretch" style={({ height: '100%' })}>
        <Box fill basis="full">
          <DrawHexView world={world} pointIndex={pointIndex} />
        </Box>
        <Box>
          <Button color="status-ok" primary plain={false}>Save</Button>
        </Box>
      </Box>
    );
  }
}
