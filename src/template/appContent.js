import React from 'react';
import { styled } from '@mui/material/styles';
import { isIOS } from 'react-device-detect'
import { useLocation } from "react-router-dom";
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import MuiDrawer from '@mui/material/Drawer';

import { routes, NavigationLink, ROUTES_NAMESPACE } from '../navigation/routes';
import Footer from './footer';
import Header from './header';
import PageContent from './pageContent';
import { VerticalSpacing } from './spacing';
import SocialIcons from 'components/socialIcons';
import LanguageSelector from 'components/language';
import { DarkModeSelector } from 'components/theme';
import { useTranslation } from '../utils';

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
    const t = useTranslation(ROUTES_NAMESPACE);
    if (variant === "permanent") {
        return (
            <Tooltip
                title={t(route.label)}
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

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

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

const DrawerContent = ({open, handleClose, handleDrawerOpen, variant = "temporary"}) => {

    const t = useTranslation(ROUTES_NAMESPACE);

    return (
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
                                    <ListItemText primary={t(route.label)} />
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flex: 1
                        }}
                    >
                        <VerticalSpacing factor={2}/>
                        <LanguageSelector />
                        <VerticalSpacing factor={2}/>
                        <DarkModeSelector />
                        <VerticalSpacing factor={2}/>
                    </Box>
                    <SocialIcons />
                    <VerticalSpacing factor={2}/>
                </React.Fragment>
            }
        </div>
    )
};

const AppContent = React.forwardRef((props, ref) => {

    const drawerSubscriptions = React.useRef([]);
    const subscribeDrawer = React.useCallback((func) => {
        drawerSubscriptions.current.push(func);
    }, []);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = React.useCallback(() => {
        setOpen(true);
        drawerSubscriptions.current.forEach(func => func(true));
    }, []);

    const handleDrawerClose = React.useCallback(() => {
        setOpen(false);
        drawerSubscriptions.current.forEach(func => func(false));
    }, []);

    const handleHistoryChanged = React.useCallback(() => {
        handleDrawerClose();
    }, [handleDrawerClose]);

    const container = window !== undefined ? () => window.document.body : undefined;

    return (
        <React.Fragment>

            <Header
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
                    <DrawerContent handleClose={handleDrawerClose} handleDrawerOpen={handleDrawerOpen} open={open} variant="temporary" />
                </SwipeableDrawer>

                <Drawer
                    open={false}
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: (isHomePage ? 'none' : 'block') }
                    }}
                >
                    <DrawerContent handleClose={handleDrawerClose} handleDrawerOpen={handleDrawerOpen} open={open} variant="permanent" />
                </Drawer>
            </Box>

            <Box
                id="scrollContainer"
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
});

export default AppContent;