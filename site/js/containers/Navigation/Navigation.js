import React, { PureComponent } from 'react';
import {
  Button, DropButton, ResponsiveContext, Box,
} from 'grommet';
import styled from 'styled-components';
import NavGrid from './NavGrid';
import worldState from '../../store/worlds.store';

const NavItem = styled.div`
margin-top: 1rem;
margin-right: 1rem;
margin-left: -1px;
`;

const NavItemSmall = styled.div`
margin: 2px;
`;
const NavButtonInner = styled(Button)`
text-align: center;
`;
const NavDropButtonInner = styled(DropButton)`
text-align: center;
`;
const NavButton = (props) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      const Container = (size === 'small') ? NavItemSmall : NavItem;
      return (
        <Container>
          <NavButtonInner {...props} plain={false} fill={size !== 'small'}>
            {props.children}
          </NavButtonInner>
        </Container>
      );
    }}
  </ResponsiveContext.Consumer>
);

const NavDropButton = (props) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      const Container = (size === 'small') ? NavItemSmall : NavItem;
      return (
        <Container>
          <NavDropButtonInner
            {...props}
            plain={false}
            fill={size !== 'small'}
            dropAlign={{
              top: size === 'small' ? 'bottom' : 'top',
              left: size === 'small' ? 'left' : 'right',
            }}
            dropContent={(
              <Box direction="column" gap="none">
                {props.children}
              </Box>
)}
          >
            {props.children}
          </NavDropButtonInner>
        </Container>
      );
    }}
  </ResponsiveContext.Consumer>
);

export default class Navigation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { ...worldState.state };
  }

  componentDidMount() {
    this._sub = worldState.subscribe(({ state }) => this.setState(state),
      (err) => {
        console.log('nav: worldState error:', err);
      });
  }

  componentWillUnmount() {
    if (this._sub) {
      this._sub.unsubscribe();
    }
  }

  render() {
    const { history } = this.props;
    const { worlds } = this.state;
    return (
      <NavGrid>
        <NavButton onClick={() => history.push('/')}>
          Home
        </NavButton>
        <NavButton onClick={() => history.push('/load')}>
          Load
        </NavButton>
        <NavButton onClick={() => history.push('/create')}>
          Create
        </NavButton>
        {worlds.size
          ? (
            <NavDropButton label="edit World">
              {Array.from(worlds.values()).map((world) => (
                <Box direction="row" pad="small" key={world.name}>
                  <Button plain fill="true" onClick={() => history.push(`/world/${world.name}`)}>{world.name}</Button>
                </Box>
              ))}
            </NavDropButton>
          )
          : ''}
        <NavButton onClick={() => history.push('/beta')}>
          Beta
        </NavButton>
      </NavGrid>
    );
  }
}
