import {
  Text, TextInput, Box, Button,
} from 'grommet';
import React, { Component } from 'react';
import _ from 'lodash';
import WorldGrid from './WorldGrid';
import worldStore from '../../../store/worlds.store';
import DrawHex from './DrawHex';

export default class WorldPage extends Component {
  constructor(props) {
    super(props);
    const worldId = _.get(props, 'match.params.worldId');
    const pointIndex = _.get(props, 'match.params.pointId');
    this.state = {
      ...worldStore.state,
      pointIndex,
      worldId,
      world: false,
    };
  }

  componentDidMount() {
    this._sub = worldStore.subscribe(({ state }) => {
      this.setState(state);
    }, (err) => {
      console.log('worldStore error: ', err);
    });
    this.fetchWorld();
  }

  fetchWorld() {
    const { worldId } = this.state;
    worldStore.actions.fetch(worldId)
      .then(() => {
        if (this.state.worldId !== worldId) return;
        if (!worldStore.state.worlds.has(worldId)) {
          this.props.history.push('/');
        } else {
          const world = worldStore.state.worlds.get(worldId);
          this.setState({ world });
        }
      })
      .catch((err) => {
        console.log('error fetching', this.state.id, err);
        console.log('========== world pushing away ', worldId);
        this.props.history.push('/');
      });
  }

  render() {
    const { world, pointIndex } = this.state;
    return (
      <WorldGrid>
        <Box gridArea="header" pad="medium">
          <Text size="medium" weight="bold">
            {world ? `Editing world ${world.name}(${world.id}), point ${pointIndex}` : `loading world ${pointIndex}`}
          </Text>
        </Box>
        <Box gridArea="editor">
          <DrawHex world={world} pointIndex={pointIndex} />
        </Box>
      </WorldGrid>
    );
  }
}
