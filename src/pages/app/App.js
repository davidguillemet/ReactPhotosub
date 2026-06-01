import React from 'react';
import { useLoaderData, useLocation } from "react-router";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { StyledEngineProvider } from '@mui/material/styles';
import ScrollTop from '../../template/scrollTop';
import { ReactRouterAwaiter } from 'components/reactRouter';

import './App.css';

import ChainedProviders from '../../components/chainedProviders';
import { QueryContextProvider } from '../../components/queryContext';
import {
    CustomThemeProvider,
    DarkModeProvider,
    FavoritesProvider,
    PortfolioProvider
} from '../../providers';
import { HelmetProvider } from 'react-helmet-async';

import AppContent from '../../template';

const scrollTopAnchor = "back-to-top-anchor";

const App = (props) => {

    const { pathname, hash, key } = useLocation();
    const { appData, ...otherProps} = props;
    const { portfolio } = appData;

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
                    <PortfolioProvider portfolio={portfolio}>
                        <AppContent {...otherProps} />
                    </PortfolioProvider>
                    <ScrollTop
                        {...otherProps}
                        anchorSelector={`#${scrollTopAnchor}`}
                    />
                </ChainedProviders>
            </StyledEngineProvider>
        </Box>
    )
}

const AppController = (props) => {
    const { appData } = useLoaderData();
    return (
        <ReactRouterAwaiter value={appData} >
            {(appData) => <App {...props} appData={appData} />}
        </ReactRouterAwaiter>
    )
};

export default AppController;

export const Component = AppController;
