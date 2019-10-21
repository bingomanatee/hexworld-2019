import React, { Component } from 'react';
import {
  Formik, Form, Field, ErrorMessage,
} from 'formik';
import {
  Text, TextInput, Box, RangeInput, Button, DataTable, Stack,
} from 'grommet';
import _ from 'lodash';

import styled from 'styled-components';
import { Schema } from '@wonderlandlabs/schema';

import PageFrame from '../../../views/PageFrame';
import worldState from '../../../store/worlds.store';

export default class Create extends Component {
  constructor(props) {
    super(props);
    const worldId = _.get(props, 'match.params.id');
    const pointId = _.get(props, 'match.params.pointId');
    this.state = {
      ...worldState.state,
      pointId,
      worldId,
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
    const { worldId, pageId } = this.state;

    return (
      <PageFrame>
        <h1>
Editing Region
          {`${pageId} of ${worldId}`}
        </h1>

      </PageFrame>
    );
  }
}
