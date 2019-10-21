import React, { Component } from 'react';
import { Box, Button, Text } from 'grommet';
import DrawWorldView from './DrawWorldView';
import worldState from '../../../store/worlds.store';

export default class DrawWorld extends Component {
  render() {
    const { world } = this.props;
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
          <DrawWorldView world={world} />
        </Box>
        <Box>
          <Button color="status-ok" primary plain={false} onClick={() => worldState.actions.save(world)}>Save</Button>
        </Box>
      </Box>
    );
  }
}
