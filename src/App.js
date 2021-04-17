import React from 'react';
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import Container from '@material-ui/core/Container';
import logo from './assets/images/logo.jpg';
import { makeStyles } from '@material-ui/core/styles';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Fab from '@material-ui/core/Fab';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Zoom from '@material-ui/core/Zoom';

import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import { BrowserRouter as Router, Switch, Route, NavLink } from "react-router-dom";
import { routes, useMenuStyles } from './navigation/routes';
import './App.css';
import { FirebaseAuth } from './components/firebase';
import { AuthProvider } from './components/authentication';
import Footer from './template/footer';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    padding: 0,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    overflow: 'hidden'
  },
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
    //padding: theme.spacing(3),
    paddingBottom: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth
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

function ScrollTop(props) {
  const { children, window } = props;
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

        <main className={clsx(classes.content, {[classes.contentShift]: open,})}>
          <div id="back-to-top-anchor" />
          <div className={classes.drawerHeader} />
          <Container className={classes.pageContainer} maxWidth={false}>
            <Switch>
            {
              routes.map((route, index) => {
                return (
                  <Route key={index} exact strict path={route.path}>
                    {route.component}
                  </Route>
                );
              })
            }
            </Switch>
          </Container>
          <Footer />
        </main>

      </Router>

      <ScrollTop {...props}>
        <Fab color="secondary" size="medium" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>

    </AuthProvider>
    </div>
  );
}

export default App;
