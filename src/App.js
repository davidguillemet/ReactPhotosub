import React from 'react';
import { useLocation } from "react-router";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { StyledEngineProvider } from '@mui/material/styles';
import ScrollTop from './template/scrollTop';

import './App.css';

import ChainedProviders from './components/chainedProviders';
import { DarkModeProvider } from 'components/theme';
import CustomThemeProvider from 'template/theme';
import { QueryContextProvider } from './components/queryContext';
import { FavoritesProvider } from './components/favorites';
import { HelmetProvider } from 'react-helmet-async';

import AppContent from './template';

const scrollTopAnchor = "back-to-top-anchor";

const App = (props) => {

    const { pathname, hash, key } = useLocation();

    React.useEffect(() => {
        // if not a hash link, scroll to top
        if (hash === '') {
            window.scrollTo(0, 0);
        }
        // else scroll to id
        else {
            setTimeout(() => {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    window.scrollTo({
                        behavior: "smooth",
                        top: element.offsetTop
                    });
                }
            }, 10);
        }
    }, [pathname, hash, key]);

    return (
        <Box sx={{ display: 'flex', minHeight: "100%"}} id="AppContainer">
            <StyledEngineProvider injectFirst>
                <ChainedProviders
                    providers={[
                        HelmetProvider,
                        DarkModeProvider,
                        CustomThemeProvider,
                        QueryContextProvider,
                        FavoritesProvider
                    ]}
                >
                    <CssBaseline />
                    <AppContent {...props} />
                    <ScrollTop
                        {...props}
                        anchorSelector={`#${scrollTopAnchor}`}
                    />
                </ChainedProviders>
            </StyledEngineProvider>
        </Box>
    )
}

export default App;
