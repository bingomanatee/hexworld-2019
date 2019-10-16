import {Box, ResponsiveContext} from "grommet/es6";
import React from "react";

export default ({children}) => {
  return <ResponsiveContext.Consumer>
    {(size) => {
      console.log('size:', size);
      switch (size) {
        case 'xsmall':
        case 'small':
          return <Box gridArea="buttons" direction="column" align="stretch" gap="medium" fill={true}>
              {React.Children.toArray(children).map(item => <div>{item}</div>)}
          </Box>;
          break;

        default:
          return <Box gridArea="buttons" direction="row" align="center" justify="center" pad="medium" fill={true}>
            <Box direction="row" fill={false} margin="medium" align="center" gap="large" alignContent="center">
              {React.Children.toArray(children).map(item => <div>{item}</div>)}
            </Box>
          </Box>
      }
    }
    }
  </ResponsiveContext.Consumer>
}
