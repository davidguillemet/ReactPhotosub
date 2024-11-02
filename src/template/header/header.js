import React  from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { IconButton } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import { useLocation } from "react-router-dom";
import { FirebaseSignin } from 'components/firebase';
import { useDarkMode } from 'components/theme';
import HeaderSearch from './search/search';
import { useAppContext } from 'template/app/appContext';

import { gsap } from "gsap";
import { useGSAP } from '@gsap/react';

function HideOnScroll(props) {
    const { children } = props;
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

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

const TopToolBar = () => {

    const { drawerOpen: open, setDrawerOpen } = useAppContext();

    const menuIconRef = React.useRef(null);
    const loginRef = React.useRef(null);

    const [ searchExpanded, setSearchExpanded ] = React.useState(false);

    const scrollTrigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0
    });
    const { darkMode } = useDarkMode();
    const location = useLocation();

    const expandTimelineRef = React.useRef(null);

    const animationEase = "power1.inOut";
    const animationDuration = 0.4;
    const isHomePage = location.pathname === '/';
    const isSearchPage = location.pathname === '/search';
    const displayToolbarButtons = !searchExpanded || isSearchPage;

    useGSAP(() => {
        if (!displayToolbarButtons) {
            if (expandTimelineRef.current === null) {
                const inputTargets = gsap.utils.toArray([
                    menuIconRef.current,
                    loginRef.current
                ]);

                const expandTween = gsap.to(inputTargets, {
                    duration: animationDuration,
                    ease: animationEase,
                    width: `0px`
                });
                expandTimelineRef.current = gsap.timeline();
                expandTimelineRef.current.add(expandTween);
            }
            expandTimelineRef.current.play();
        } else if (expandTimelineRef.current !== null) {
            expandTimelineRef.current.reverse().then(() => {
                // clear expand timeline to manage login state change
                // that has ean effect on loginRef width
                expandTimelineRef.current = null;
                unsetLoginContainerWidth();
            });
        }
    }, {
        dependencies: [displayToolbarButtons]
    });

    const unsetLoginContainerWidth = React.useCallback(() => {
        if (loginRef.current === null) {
            return;
        }
        // Remove width property that might have been fixed by the GSap animation...
        loginRef.current.style.removeProperty('width');
    }, []);

    return (
        <HideOnScroll>
        <AppBar
            elevation={scrollTrigger ? 4 : 0}
            position="fixed"
            open={open}
            sx={{
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'divider',
                ...(
                    isHomePage ?  {
                        transition: 'background-color 500ms linear',
                        backgroundColor: 'transparent',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            transition: 'background-color 500ms linear'
                        }
                    } :
                    darkMode === true ? { backgroundColor: 'rgba(0,0,0,0.9)'} :
                    { }
                )
            }}
        >
            <Toolbar sx={{ '&.MuiToolbar-root': { padding: '10px' }}}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >

                    <Box ref={menuIconRef} sx={{ display: 'flex', overflow: 'hidden' }}>
                        <IconButton
                            aria-label="open drawer"
                            onClick={() => setDrawerOpen(true)}
                            sx={{
                                mr: 0,
                                transition: 'opacity 0.5s'
                            }}
                        >
                            <MenuIcon sx={{ color: theme => theme.palette.text.primary }} />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", flex: 1 }}>
                        <HeaderSearch
                            visible={!isSearchPage}
                            onExpandedChange={setSearchExpanded}
                        />
                    </Box>

                    <Box ref={loginRef} sx={{ display: 'flex', overflow: 'hidden' }}>
                        <FirebaseSignin onLoginStateChange={unsetLoginContainerWidth} />
                    </Box>

                </Box>
            </Toolbar>
        </AppBar>
        </HideOnScroll>
    );
};

export default TopToolBar;
