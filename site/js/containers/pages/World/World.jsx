import {
  Text, TextInput, Box, Button,
} from 'grommet';
import React, { Component } from 'react';
import _ from 'lodash';
import WorldGrid from './WorldGrid';
import worldStore from '../../../store/worlds.store';
import DrawWorld from './DrawWorld';

import Elevations from './panels/Elevations';
import Brushes from './panels/Brush';

export default class WorldPage extends Component {
  constructor(props) {
    super(props);
    const id = _.get(props, 'match.params.id');
    this.state = { world: false, id };
  }

  componentWillUnmount() {
    if (this._sub) this._sub.unsubscribe();
  }

  componentDidMount() {
    this._sub = worldStore.subscribe(({ state }) => {
      this.setState(state);
    }, (err) => {
      console.log('worldStore error: ', err);
    });

    worldStore.actions.setEditedPoint(false);
    worldStore.actions.fetch(this.state.id)
      .then(() => {
        if (!worldStore.state.worlds.has(this.state.id)) {
          this.props.history.push('/');
        } else {
          const world = worldStore.state.worlds.get(this.state.id);
          this.setState({ world });
        }
      })
      .catch((err) => {
        console.log('error fetching', this.state.id, err);
        console.log('========== world pushing away ', this.state.id);
        this.props.history.push('/');
      });
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const id = _.get(this, 'props.match.params.id');
    if (this.state.world.id !== id) {
      return worldStore.state.worlds.get(id);
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, world) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (world) {
      this.setState({ world });
    } else world = this.state.world;

    console.log('this.state.editedPoint', this.state.editedPoint);
    if (this.state.editedPoint) {
      const { pointIndex, worldId } = this.state.editedPoint;
      this.props.history.push(`/world/${worldId}/${pointIndex}`);
    }
  }

  render() {
    const { world, id } = this.state;
    return (
      <WorldGrid>
        <Box gridArea="header" pad="medium">
          <Text size="medium" weight="bold">
            {world ? `Editing world ${world.name}(${world.id})` : `loading world ${id}`}
          </Text>
        </Box>
        <Box gridArea="editor">
          <DrawWorld world={world} />
        </Box>
        <Box gridArea="panel-one">
          <Elevations world={world} />
        </Box>
        <Box gridArea="panel-two">
          <Brushes world={world} />
        </Box>
      </WorldGrid>
    );
  }
}
