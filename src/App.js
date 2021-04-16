import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import logo from './assets/images/logo.jpg';
import { makeStyles } from '@material-ui/core/styles';
import Navigation from './navigation';
import Fade from '@material-ui/core/Fade';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Fab from '@material-ui/core/Fab';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Zoom from '@material-ui/core/Zoom';

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import Home from "./pages/home";
import Destinations from "./pages/destinations";
import Destination from "./pages/destination";
import Search from "./pages/search";
import Finning from './pages/finning';
import Simulation from './pages/simulation';
import MySelection from './pages/favorites';
import { FirebaseAuth } from './components/firebase';
import { AuthProvider } from './components/authentication';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  pageContainer: {
    margin: 0,
    marginTop: 30,
    width: '100%',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sticky: {
    top: '-130px'
  },
  selected: {
    borderTopWidth: '3px'
  },
  accountIcon: {
    color: 'white',
    position: 'absolute',
    top: 10,
    right: 10
  }
}));

function ElevationScroll(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 6 : 0,
  });
}

function ScrollTop(props) {
  const { children, window } = props;
  const classes = useStyles();
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" style={{
          position: 'fixed',
          bottom: 20,
          right: 20
        }}>
        {children}
      </div>
    </Zoom>
  );
}

function App(props) {

  const classes = useStyles();

  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <ElevationScroll {...props}>
          <AppBar position="sticky" classes={{
            root: classes.root,
            positionSticky: classes.sticky
          }}>
            <FirebaseAuth />
            <img src={logo} className="logo" alt="logo" />
            <Navigation></Navigation>
          </AppBar>
        </ElevationScroll>
        <div id="back-to-top-anchor" />
        <Box className={classes.pageContainer}>
            <Switch>
              <Route exact strict path="/">
                <Home />
              </Route>
              <Route exact strict path="/destinations">
                <Destinations />
              </Route>
              <Route exact strict path="/destinations/:year/:title">
                <Destination />
              </Route>
              <Route exact strict path="/search">
                <Search />
              </Route>
              <Route exact strict path="/finning">
                <Finning />
              </Route>
              <Route exact strict path="/simulation">
                <Simulation />
              </Route>
              <Route exact strict path="/my_selection">
                <MySelection />
              </Route>
            </Switch>
        </Box>
      </Router>
      <ScrollTop {...props}>
        <Fab color="secondary" size="medium" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
      </AuthProvider>
  );
}

export default App;
