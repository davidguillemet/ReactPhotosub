import React from 'react';
import { isIOS } from 'react-device-detect'
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import logo from './assets/images/logo.jpg';
import { styled, ThemeProvider } from '@material-ui/core/styles';

import Hidden from '@material-ui/core/Hidden';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import { BrowserRouter as Router } from "react-router-dom";
import { withRouter } from "react-router";
import { routes, NavigationLink } from './navigation/routes';
import { FirebaseSignin } from './components/firebase';
import { AuthProvider } from './components/authentication';
import Footer from './template/footer';
import ScrollTop from './template/scrollTop';
import PageContent from './template/pageContent';
import ResponsiveTheme from './template/theme';

import './App.css';

const drawerWidth = 240;
const scrollTopAnchor = "back-to-top-anchor";

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => {
  return {
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
    overflow: 'hidden',
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }}
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const TopToolBar = withRouter(({open, handleDrawerOpen, location}) => {

  const transparent = location.pathname === '/';

  return (
    <AppBar
      position="fixed"
      sx={{ 
        width: '100%',
        ...(transparent && { backgroundColor: "transparent" })
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{ mr: 2, ...(open && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        <FirebaseSignin />
      </Toolbar>
    </AppBar>
  )    
})

function App(props) {

  const [open, setOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleHistoryChanged = () => {
    handleDrawerClose();
  }
  
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

  const drawerContent = (
    <div>
      <DrawerHeader>
        <IconButton
          color="inherit"
          aria-label="close drawer"
          onClick={handleDrawerClose}
          edge="start"
          sx={{ ml: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </DrawerHeader>
    <Divider variant="middle" />
    <Box sx={{
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    }}>
      <img src={logo} className="logo" alt="logo" />
    </Box>
    <List style={{width: '100%', marginTop: 30, marginBottom: 30}}>
    {
      routes.filter(route => route.sidebar).map((route, index) => {
        return (
          <NavigationLink key={index} to={route.path} isActive={isLinkActive}>
            <ListItem button>
              <ListItemIcon>
                {route.icon}
              </ListItemIcon>
              <ListItemText primary={route.label} />
            </ListItem>
          </NavigationLink>
        );
      })
    }
    </List>
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <div style={{ display: 'flex'}}>
    <ThemeProvider theme={ResponsiveTheme}>
    <AuthProvider>

      <CssBaseline />

      <Router>

        <TopToolBar open={open} handleDrawerOpen={handleDrawerOpen} />

        <nav style={{
              width: drawerWidth,
              flexShrink: 0
          }}
        >
        <Hidden smUp implementation="css">
          <SwipeableDrawer
            disableBackdropTransition={!isIOS}
            disableDiscovery={isIOS}
            container={container}
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            onOpen={handleDrawerToggle}
            sx={{
              '& .MuiPaper-root': {
                width: drawerWidth
              }
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawerContent}
          </SwipeableDrawer>
        </Hidden>
        </nav>

        <Main open={open}>
          <div id={scrollTopAnchor} />
          <DrawerHeader />
          <PageContent onHistoryChanged={handleHistoryChanged}/>
          <Footer />
        </Main>

      </Router>

      <ScrollTop {...props} anchorSelector={`#${scrollTopAnchor}`}></ScrollTop>

    </AuthProvider>
    </ThemeProvider>
    </div>
  );
}

export default App;
