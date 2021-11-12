import React from 'react';
import { isIOS } from 'react-device-detect'
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import logo from './assets/images/logo.jpg';
import { styled, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import Hidden from '@mui/material/Hidden';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { routes, NavigationLink } from './navigation/routes';
import { FirebaseSignin } from './components/firebase';
import { AuthProvider } from './components/authentication';
import GlobalContextProvider from './components/globalContext';
import ReactQueryClientProvider from './components/reactQuery';
import Footer from './template/footer';
import ScrollTop from './template/scrollTop';
import PageContent from './template/pageContent';
import ResponsiveTheme from './template/theme';
import SocialIcons from './components/socialIcons';

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
    }
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

const TopToolBar = ({ open, handleDrawerOpen }) => {

    const location = useLocation();
    const transparent = location.pathname === '/';

    return (
        <AppBar
            position="fixed"
            sx={{
                width: '100%',
                ...(transparent && { backgroundColor: 'rgba(0,0,0,0.2)' })
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    size="large">
                    <MenuIcon />
                </IconButton>
                <FirebaseSignin />
            </Toolbar>
        </AppBar>
    );
};

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
                    size="large">
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
            <List sx={{ width: '100%', myt: 3, mb: 1 }}>
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
            <Divider variant="middle" />
            <SocialIcons />
        </div>
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <div style={{ display: 'flex' }}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={ResponsiveTheme}>
                    <ReactQueryClientProvider>
                        <GlobalContextProvider>
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
                                        <PageContent onHistoryChanged={handleHistoryChanged} />
                                        <Footer />
                                    </Main>

                                </Router>

                                <ScrollTop {...props} anchorSelector={`#${scrollTopAnchor}`}></ScrollTop>

                            </AuthProvider>
                        </GlobalContextProvider>
                    </ReactQueryClientProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </div>
    );
}

export default App;
