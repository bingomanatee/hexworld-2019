import React, { Component } from 'react';
import {
  Formik, Form, Field, ErrorMessage,
} from 'formik';
import {
  Text, TextInput, Box, RangeInput, Button, DataTable, Stack,
} from 'grommet';
import styled from 'styled-components';
import { Schema } from '@wonderlandlabs/schema';

import PageFrame from '../../../views/PageFrame';
import worldState from '../../../store/worlds.store';

const Centered = styled.div `
width: 100%;
height: 100%;
display: flex;
justify-content: center;
align-items: center;
`;

const COLUMNS = [
  {
    property: 'id',
    primary: true,
    header: 'ID',
    sortable: true,
    render(world) {
      if (!world.id) {
        return 'new';
      }
      return world.id;
    },
  },
  {
    property: 'name',
    sortable: true,
    header: 'Name',
  },
  {
    property: 'resolution',
    sortable: true,
    header: 'Res',
  },
  {
    property: 'id',
    sortable: false,
    render(world) {
      return (
        <Centered>
          <Box
            direction="row"
            round="small"
            pad="xsmall"
            fill={false}
            background="status-error"
            justify="center"
            onClick={() => worldState.actions.deleteWorld(world)}
          >
            <span>&times;</span>
            <span>&nbsp;</span>
            <span>Delete</span>
          </Box>
        </Centered>
      );
    },
  },
];

export default class Create extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...worldState.state,
      hasError: false,
    };
  }

  componentDidMount() {
    this._sub = worldState.subscribe(({ state }) => {
      this.setState(state);
    },
    (err) => {
      console.log('nav: worldState error:', err);
    });

    worldState.actions.load();
  }

  componentWillUnmount() {
    if (this._sub) this._sub.unsubscribe();
  }

  get schema() {
    if (!this._schema) {
      this._schema = new Schema('world', {
        name: {
          type: 'string',
          required: true,
          validator: (name) => {
            if (name.length < 4) return 'name must be at least 4 characters';
            return false;
          },
          defaultValue: '',
        },
        range: {
          type: 'integer',
          required: true,
          defaultValue: 20,
        },
      });
    }
    return this._schema;
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({
      hasError: {
        error,
        info,
      },
    });
    // You can also log the error to an error reporting service
  }

  render() {
    const { history } = this.props;
    const { worlds, hasError } = this.state;
    if (hasError) {
      console.log('error in component', hasError);
      return '';
    }
    const initial = this.schema.instance();
    initial.resolution = 1;
    const list = worlds instanceof Map ? Array.from(worlds.values()) : [];
    return (
      <PageFrame>
        <h1>Load a saved world</h1>

        <DataTable data={list || []} sortable columns={COLUMNS} style={({ width: '100%' })} />
      </PageFrame>
    );
  }
}
