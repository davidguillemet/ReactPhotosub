import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { StyledEngineProvider } from '@mui/material/styles';
import ScrollTop from './template/scrollTop';

import './App.css';

import ChainedProviders from './components/chainedProviders';
import { DarkModeProvider } from 'components/theme';
import CustomThemeProvider from 'template/theme';
import { QueryContextProvider } from './components/queryContext';
import { AuthProvider } from './components/authentication';
import { FavoritesProvider } from './components/favorites';
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
                        DarkModeProvider,
                        CustomThemeProvider,
                        QueryContextProvider,
                        AuthProvider,
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
