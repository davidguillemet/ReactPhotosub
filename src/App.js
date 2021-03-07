import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import logo from './assets/images/logo.jpg';
import { makeStyles } from '@material-ui/core/styles';
import Navigation from './navigation';

import { Router  } from "@reach/router";
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
        <AppBar position="sticky" classes={{
          root: classes.root,
          positionSticky: classes.sticky
          }}>
          <img src={logo} className="logo" alt="logo" />
          <Navigation></Navigation>
        </AppBar>
        <Toolbar />
          <Router style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
            <Home path="/" />
            <Destinations path="destinations" />
            <Search path="search" />
            <Finning path="finning" />
            <Simulation path="simulation" />
          </Router>
      </React.Fragment> 
    );
}

export default App;
