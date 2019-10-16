import React, { Component } from 'react';
import {
  Formik, Form, Field, ErrorMessage,
} from 'formik';
import {
  Text, TextInput, Box, RangeInput, Button,
} from 'grommet';
import { Schema } from '@wonderlandlabs/schema';

import PageFrame from '../../../views/PageFrame';
import worldState from '../../../store/worlds.store';

export default class Create extends Component {
  constructor(props) {
    super(props);

    this.state = { ...worldState.state };
  }

  componentDidMount() {
    this._sub = worldState.subscribe(({ state }) => {
      this.setState(state);
    },
    (err) => {
      console.log('nav: worldState error:', err);
    });
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

  render() {
    const { history } = this.props;
    const initial = this.schema.instance();
    initial.resolution = 1;
    return (
      <PageFrame>
        <h1>Create a world</h1>
        <Formik
          initialValues={initial}
          validate={(values) => {
            const errorState = this.schema.validate(values);
            const errors = {};
            errorState.fields.forEach((field, name) => {
              if (!field.isValid) {
                errors[name] = field.errors[0];
              }
            });
            return errors;
          }}
          onSubmit={(values, form) => {
            const { setSubmitting, resetForm, setFieldValue } = form;
            console.log('submit form: ', form);
            worldState.actions.addWorld(values);
            history.push(`/world/${values.name}`);
            resetForm(this.schema.instance());
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <CreateGrid>
                <Box gridArea="name-label" direction="row" align="center" alignContent="start">
                  <Text align="center">Name </Text>
                </Box>
                <Box gridArea="name-field" direction="column" align="center" alignContent="start">
                  <Field name="name" id="name" type="text">
                    {({ field: { value }, form: { setFieldValue } }) => (
                      <TextInput
                        value={value}
                        onChange={(e) => {
                          setFieldValue('name', e.target.value);
                        }}
                        name="name"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="name" component="div" />
                </Box>
                <Box gridArea="resolution-label" direction="row" align="center" alignContent="start">
                  <Text align="center">Resolution </Text>
                </Box>
                <Box gridArea="resolution-field" direction="column" align="center" alignContent="start">
                  <Field name="resolution" id="resolution" type="number">
                    {({ field: { value }, form: { setFieldValue } }) => (
                      <Box direction="row" fill gap="medium">
                        <RangeInput
                          value={value || 1}
                          onChange={(e) => {
                            setFieldValue('resolution', parseInt(e.target.value, 10));
                          }}
                          name="resolution"
                          min={1}
                          max={4}
                          step={1}
                        />
                        <div>{value || 0}</div>
                      </Box>
                    )}
                  </Field>
                </Box>
                <ButtonBox>
                  <Button type="submit" primary plain={false}>Create World</Button>
                  <Button type="button" plain={false}>Cancel</Button>
                </ButtonBox>
              </CreateGrid>
            </Form>
          )}
        </Formik>
      </PageFrame>
    );
  }
}
