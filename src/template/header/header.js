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
    const transparent = location.pathname === '/';
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
            expandTimelineRef.current.reverse();
        }
    }, {
        dependencies: [displayToolbarButtons]
    });

    return (
        <HideOnScroll>
        <AppBar
            elevation={scrollTrigger ? 4 : 0}
            position="fixed"
            open={open}
            sx={{
                ...(
                    transparent ?  { backgroundColor: 'rgba(0,0,0,0.2)' } :
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
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => setDrawerOpen(true)}
                            sx={{
                                mr: 0,
                                transition: 'opacity 0.5s'
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", flex: 1 }}>
                        <HeaderSearch
                            visible={!isSearchPage}
                            onExpandedChange={setSearchExpanded}
                        />
                    </Box>

                    <Box ref={loginRef} sx={{ display: 'flex', overflow: 'hidden' }}>
                        <FirebaseSignin />
                    </Box>

                </Box>
            </Toolbar>
        </AppBar>
        </HideOnScroll>
    );
};

export default TopToolBar;
