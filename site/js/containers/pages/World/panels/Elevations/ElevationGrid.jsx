import React from 'react';
import { Grid, ResponsiveContext, Box } from 'grommet';
import _ from 'lodash';

export default ({ children, world }) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      const rows = _.range(0, world.elevations.length).map(() => 'auto');
      switch (size) {
        default:
          return (
            <Grid
              columns={['22px', '2fr', '3fr', '4px']}
              rows={['2rem', ...rows]}
              gap="none"
              pad="2px"
              margin="small"
              className="elevation-frame"
              areas={world.areas()}
            >
              <Box gridArea="label-head" className="panel-label">Label</Box>
              <Box gridArea="value-head" className="panel-label">Value</Box>
              {children}
            </Grid>
          );
      }
    }}
  </ResponsiveContext.Consumer>
);
