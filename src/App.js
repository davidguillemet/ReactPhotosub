import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import logo from './assets/images/logo.jpg';
import { makeStyles } from '@material-ui/core/styles';
import Navigation from './navigation';
import Fade from '@material-ui/core/Fade';

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css';
import Home from "./pages/home";
import Destinations from "./pages/destinations";
import Search from "./pages/search";
import Finning from './pages/finning';
import Simulation from './pages/simulation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  sticky: {
    top: '-130px'
  },
  selected: {
    borderTopWidth: '3px'
  }
}));

function App() {
  
  const classes = useStyles();

  return (
      <React.Fragment>
        <CssBaseline />
        <Router>
          <AppBar position="sticky" classes={{
            root: classes.root,
            positionSticky: classes.sticky
            }}>
            <img src={logo} className="logo" alt="logo" />
            <Navigation></Navigation>
          </AppBar>
            <Box style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <Fade in={true} timeout={{
                  appear: 1000,
                  enter: 1000,
                  exit: 1000
                }}>
                <Switch>
                  {/* Nesting Route in Empty component as workaround to force Switch
                    * component being rerendred when licking a navigation link
                    */}
                  <>
                    <Route exact strict path="/">
                      <Home/>
                    </Route>
                    <Route exact strict path="/destinations">
                        <Destinations/>
                    </Route>
                    <Route exact strict path="/search">
                      <Search/>
                    </Route>
                    <Route exact strict path="/finning">
                      <Finning/>
                    </Route>
                    <Route exact strict path="/simulation">
                      <Simulation/>
                    </Route>
                  </>
                </Switch>
              </Fade>
            </Box>
        </Router>
      </React.Fragment> 
    );
}

export default App;
