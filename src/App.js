import React from 'react';
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import logo from './assets/images/logo.jpg';
import { makeStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import { BrowserRouter as Router, NavLink } from "react-router-dom";
import { routes, useMenuStyles } from './navigation/routes';
import { FirebaseAuth } from './components/firebase';
import { AuthProvider } from './components/authentication';
import Footer from './template/footer';
import ScrollTop from './template/scrollTop';
import PageContent from './template/pageContent';

import './App.css';

const drawerWidth = 240;
const scrollTopAnchor = "back-to-top-anchor";

const useStyles = makeStyles((theme) => ({
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  closeButton: {
    marginLeft: theme.spacing(1),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    flexGrow: 1,
    paddingBottom: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    overflow: 'hidden'
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  drawerPaper: {
    display: 'flex',
    width: 'inherit'
  }
}));

function App(props) {

  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const menuClasses = useMenuStyles();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function isLinkActive(match, location) {
    if (match === null) {
      return false;
    }

    if (match.url === "/" || match.url === "") {
      return location.pathname === "/";
    }

    if (location.pathname.indexOf(match.url) === 0) {
      return true;
    }

    return false;    
  }

  return (
    <div style={{display: 'flex'}}>
    <AuthProvider>

      <CssBaseline />

      <Router>

        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <FirebaseAuth />
          </Toolbar>
        </AppBar>

        <nav>
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={open}
            classes={{
              paper: classes.drawerPaper
            }}
          >
            <div className={classes.drawerHeader}>
              <IconButton
                color="inherit"
                aria-label="close drawer"
                onClick={handleDrawerClose}
                edge="start"
                className={classes.closeButton}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <Divider variant="middle" />
            <img src={logo} className="logo" alt="logo" />
            <List style={{width: '100%', marginTop: 30, marginBottom: 30}}>
            {
              routes.filter(route => route.sidebar).map((route, index) => {
                return (
                  <NavLink key={index} to={route.path} className={menuClasses.link} isActive={isLinkActive}>
                    <ListItem button>
                      <ListItemIcon>
                        {route.icon}
                      </ListItemIcon>
                      <ListItemText primary={route.label} />
                    </ListItem>
                  </NavLink>
                );
              })
            }
            </List>
          </Drawer>
        </nav>

        <main className={clsx(classes.content, {[classes.contentShift]: open})}>
          <div id={scrollTopAnchor} />
          <div className={classes.drawerHeader} />
          <PageContent />
          <Footer />
        </main>

      </Router>

      <ScrollTop {...props} anchorSelector={`#${scrollTopAnchor}`}></ScrollTop>

    </AuthProvider>
    </div>
  );
}

export default App;
