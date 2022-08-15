import React, { useCallback, useRef } from 'react';
import { isIOS } from 'react-device-detect'
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
//ximport logo from './assets/images/logo.jpg';
import { styled, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MuiDrawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { routes, NavigationLink } from './navigation/routes';
import { FirebaseSignin } from './components/firebase';
import { AuthProvider } from './components/authentication';
import GlobalContextProvider from './components/globalContext';
import { ReactQueryClientProvider } from './components/reactQuery';
import Footer from './template/footer';
import ScrollTop from './template/scrollTop';
import PageContent from './template/pageContent';
import ResponsiveTheme from './template/theme';
import SocialIcons from './components/socialIcons';

import { ToastContextProvider } from './components/notifications';

import './App.css';
import { VerticalSpacing } from './template/spacing';

const drawerWidth = 240;
const miniDrawerWidth = 56;
const scrollTopAnchor = "back-to-top-anchor";

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `${miniDrawerWidth}px`
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        zIndex: theme.zIndex.drawer - 1
    })
}));

//const Image = styled('img')(({ theme }) => ({ }));

function HideOnScroll(props) {
    const { children } = props;
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

const TopToolBar = ({ open, handleDrawerOpen, handleDrawerClose }) => {

    const scrollTrigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0
    });
    const location = useLocation();
    const transparent = location.pathname === '/';

    return (
        <HideOnScroll>
        <AppBar
            elevation={scrollTrigger ? 4 : 0}
            position="fixed"
            open={open}
            sx={{
                ...(transparent && { backgroundColor: 'rgba(0,0,0,0.2)' })
            }}
        >
            <Toolbar>
                {
                    !open &&
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ ml: "-21px", mr: 2, ...(open && { display: 'none' }) }}
                        size="large">
                        <MenuIcon />
                    </IconButton>
                }
                <FirebaseSignin />
            </Toolbar>
        </AppBar>
        </HideOnScroll>
    );
};

const AppContent = (props) => {

    const drawerSubscriptions = useRef([]);
    const subscribeDrawer = useCallback((func) => {
        drawerSubscriptions.current.push(func);
    }, []);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
        drawerSubscriptions.current.forEach(func => func(true));
    };

    const handleDrawerClose = () => {
        setOpen(false);
        drawerSubscriptions.current.forEach(func => func(false));
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

    const MenuItemIcon = ({route, variant, children}) => {
        if (variant === "permanent") {
            return (
                <Tooltip
                    title={route.label}
                    arrow
                    placement="right"
                >
                    {children}
                </Tooltip>
            )
        } else {
            return children;
        }
    }

    const DrawerContent = ({open, handleClose, variant = "temporary"}) => (
        <div>
            <DrawerHeader>
                {
                    variant === "temporary" && open &&
                    <IconButton
                        color="inherit"
                        aria-label="close drawer"
                        onClick={handleClose}
                        edge="start"
                        sx={{ ml: "-5px" }}
                        size="large">
                        <CloseIcon />
                    </IconButton>
                }
                {
                    variant === 'permanent' &&
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ ml: "-5px", ...(open && { display: 'none' }) }}
                        size="large">
                        <MenuIcon />
                    </IconButton>
                }
            </DrawerHeader>
            <Divider variant="middle" />
            { /* 
            <Box sx={{
                display: 'flex',
                alignItems: 'center'
            }}>
                <Image
                    src={logo}
                    alt="logo"
                    sx={{
                        height: "95px",
                        mt: "10px",
                        mx: "auto",
                        ...(variant === "permanent" && {
                            opacity: 0,
                            //transform: "rotate(90deg) translateY(46px) scale(0.5)"
                            transform: "translateX(-47px) scale(0.32)"
                        })
                    }}
                />
            </Box> */ }
            <List sx={{ width: '100%', myt: 3, mb: 1 }}>
                {
                    routes.filter(route => route.sidebar).map((route, index) => {
                        return (
                            <NavigationLink key={index} to={route.path} isActive={isLinkActive}>
                                <ListItem button>
                                    <MenuItemIcon variant={variant} route={route}>
                                        <ListItemIcon>
                                            {route.icon}
                                        </ListItemIcon>
                                    </MenuItemIcon>
                                    <ListItemText primary={route.label} />
                                </ListItem>
                            </NavigationLink>
                        );
                    })
                }
            </List>
            <Divider variant="middle" />
            {
                variant === "temporary" &&
                <React.Fragment>
                    <VerticalSpacing factor={2}/>
                    <SocialIcons />
                    <VerticalSpacing factor={2}/>
                </React.Fragment>
            }
        </div>
    );

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <React.Fragment>

            <TopToolBar
                open={open}
                handleDrawerOpen={handleDrawerOpen}
                handleDrawerClose={handleDrawerClose}
            />

            <Box
                component="nav"
                //sx={{ width: { lg: (open ? drawerWidth : miniDrawerWidth) }, flexShrink: { lg: 0 } }}
                sx={{ width: { lg: (isHomePage ? 0 : miniDrawerWidth) }, flexShrink: { lg: 0 } }}
            >
                <SwipeableDrawer
                    disableBackdropTransition={!isIOS}
                    disableDiscovery={isIOS}
                    container={container}
                    variant="temporary"
                    anchor="left"
                    open={open}
                    onClose={handleDrawerClose}
                    onOpen={handleDrawerOpen}
                    sx={{
                        /*display: { xs: 'block', lg: 'none' },*/
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        '& .MuiPaper-root': {
                            width: drawerWidth
                        }
                    }}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                >
                    <DrawerContent handleClose={handleDrawerClose} open={open} variant="temporary" />
                </SwipeableDrawer>

                <Drawer
                    open={false}
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: (isHomePage ? 'none' : 'block') }
                    }}
                >
                    <DrawerContent handleClose={handleDrawerClose} open={open} variant="permanent" />
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: "hidden",
                    minHeight: '100vh',
                    flexGrow: 1,
                    paddingBottom: 0,
                    p: 0,
                }}
            >
                <div id={scrollTopAnchor} />
                <DrawerHeader />
                <PageContent onHistoryChanged={handleHistoryChanged} subscribeDrawer={subscribeDrawer} />
                <Footer />
            </Box>

        </React.Fragment>
    );
}

const App = (props) => {

    return (
        <div style={{ display: 'flex' }}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={ResponsiveTheme}>
                    <ToastContextProvider>
                        <ReactQueryClientProvider>
                            <GlobalContextProvider>
                                <AuthProvider>

                                    <CssBaseline />

                                    <Router>
                                        <AppContent {...props} />
                                    </Router>

                                    <ScrollTop {...props} anchorSelector={`#${scrollTopAnchor}`}></ScrollTop>

                                </AuthProvider>
                            </GlobalContextProvider>
                        </ReactQueryClientProvider>
                    </ToastContextProvider>
                </ThemeProvider>
            </StyledEngineProvider>
        </div>
    )
}

export default App;
