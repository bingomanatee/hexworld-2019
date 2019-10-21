import React, { PureComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Grommet, Box } from 'grommet';

import SiteHeader from '../SiteHeader';
import Content from '../../views/Content';
import Navigation from '../Navigation';
import worldStore from '../../store/worlds.store';
import MainGrid from './MainGrid';
import { World } from '../../hexagon';
import theme from '../../theme';

console.log('defining world class:', World);
worldStore.actions.defineWorldClass(World);
// pages

import Home from '../pages/Home';
import Create from '../pages/Create';
import Load from '../pages/Load';
import WorldPage from '../pages/World';
import HexPage from '../pages/HexPage';



export default class Main extends PureComponent {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <main>
        <Grommet theme={theme} full>
          <MainGrid>
            <Box className="site-header" gridArea="header">
              <SiteHeader />
            </Box>
            <Box gridArea="nav">
              <Navigation />
            </Box>
            <Box id="main" gridArea="main" style={({ overflow: 'auto' })}>
              <Content>
                <Switch>
                  <Route path="/" exact component={Home} />
                  <Route path="/load" component={Load} />
                  <Route path="/create" component={Create} />
                  <Route path="/world/:id" exact component={WorldPage} />
                  <Route path="/world/:id/:pointId" exact component={HexPage} />
                  <Route component={Home} />
                </Switch>
              </Content>
            </Box>
          </MainGrid>
        </Grommet>
      </main>
    );
  }
}
