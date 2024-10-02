import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { StyledEngineProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from "react-router-dom";
import { FirebaseProvider } from './components/firebase';
import ScrollTop from './template/scrollTop';

import { ToastContextProvider } from './components/notifications';

import './App.css';

import ChainedProviders from './components/chainedProviders';
import { DarkModeProvider } from 'components/theme';
import CustomThemeProvider from 'template/theme';
import { QueryContextProvider } from './components/queryContext';
import { AuthProvider } from './components/authentication';
import { FavoritesProvider } from './components/favorites';
import { ReactQueryClientProvider } from './components/reactQuery';
import { TranslationProvider } from './utils';
import { OverlayProvider } from './components/loading/loadingOverlay';
import { DataManagerProvider } from './components/dataProvider';
import { HelmetProvider } from 'react-helmet-async';

import AppContent from './template';

const scrollTopAnchor = "back-to-top-anchor";

const App = (props) => {

    return (
        <Box sx={{ display: 'flex', minHeight: "100%"}} id="AppContainer">
            <StyledEngineProvider injectFirst>
                <ChainedProviders
                    providers={[
                        HelmetProvider,
                        ToastContextProvider,
                        DarkModeProvider,
                        CustomThemeProvider,
                        OverlayProvider,
                        TranslationProvider,
                        ReactQueryClientProvider,
                        FirebaseProvider,
                        DataManagerProvider,
                        QueryContextProvider,
                        AuthProvider,
                        FavoritesProvider
                    ]}
                >
                    <CssBaseline />
                    <Router>
                        <AppContent {...props} />
                    </Router>
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
