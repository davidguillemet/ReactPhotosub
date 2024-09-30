import React  from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import { useLocation } from "react-router-dom";
import { FirebaseSignin } from 'components/firebase';
import { useDarkMode } from 'components/theme';
import HeaderSearch from './search/search';
import { useAppContext } from 'template/app/appContext';

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

    const scrollTrigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0
    });
    const { darkMode } = useDarkMode();
    const location = useLocation();

    const signInContainerRef = React.useRef(null);
    const handleOnSearchExpandedChange = React.useCallback((searchExpanded) => {
        if (searchExpanded) {
            signInContainerRef.current.classList.add('hidden');
        } else {
            signInContainerRef.current.classList.remove('hidden');
        }
    }, []);

    const transparent = location.pathname === '/';
    const isSearchPage = location.pathname === '/search';

    return (
        <HideOnScroll>
        <AppBar
            elevation={scrollTrigger ? 4 : 0}
            position="fixed"
            open={open}
            sx={{
                ...(
                    transparent ? 
                    { backgroundColor: 'rgba(0,0,0,0.2)' } :
                    darkMode === true ? { backgroundColor: 'rgba(0,0,0,0.9)'} :
                    { }
                )
            }}
        >
            <Toolbar sx={{ '&.MuiToolbar-root': { paddingRight: '10px', paddingLeft: 0}}}>

                {
                    !open &&
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ mr: 0, ...(open && { display: 'none' }) }}
                        size="large"
                    >
                        <MenuIcon />
                    </IconButton>
                }

                <Box
                    ref={signInContainerRef}
                    sx={{
                        display: 'flex',
                        flexGrow: 0,
                        zIndex: 1,
                        transition: 'opacity 0.5s',
                        '&.hidden': {
                            opacity: 0,
                            zIndex: 0
                        }
                    }}
                >
                    <FirebaseSignin />
                </Box>

                { /* Search after FirebaseSignin to make sure zIndex is greater */ }
                {   
                    !isSearchPage &&
                    <HeaderSearch
                        onExpandedChange={handleOnSearchExpandedChange}
                    />
                }

            </Toolbar>
        </AppBar>
        </HideOnScroll>
    );
};

export default TopToolBar;
