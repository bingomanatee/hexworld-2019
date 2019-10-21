import React from 'react';
import {Grid, ResponsiveContext} from 'grommet';

export default ({children}) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      switch (size) {
        case 'small':
        case 'medium':
          return (
            <Grid
              rows={['4rem', 'auto', '18rem']}
              columns={['1fr', '1fr']}
              gap="small"
              pad="small"
              fill
              className="world-frame"
              areas={[
                {name: 'header', start: [0, 0], end: [1, 0]},
                {name: 'editor', start: [0, 1], end: [1, 1]},
                {name: 'panel-one', start: [0, 2], end: [0, 2]},
                {name: 'panel-two', start: [1, 2], end: [1, 2]},
              ]}
            >
              {children}
            </Grid>
          );

          break;

        default:
          return (
            <Grid
              rows={['4rem', '1fr', '1fr']}
              columns={['auto', '14rem']}
              gap="small"
              pad="small"
              fill
              className="world-frame"
              areas={[
                {name: 'header', start: [0, 0], end: [1, 0]},
                {name: 'panel-one', start: [1, 1], end: [1, 1]},
                {name: 'panel-two', start: [1, 2], end: [1, 2]},
                {name: 'editor', start: [0, 1], end: [0, 2]},
              ]}
            >
              {children}
            </Grid>
          );
      }
    }}
  </ResponsiveContext.Consumer>
);
