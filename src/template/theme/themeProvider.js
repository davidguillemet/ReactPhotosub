import React from 'react';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { useDarkMode } from 'components/theme';

const paletteDarkMode = {
    mode: 'dark',
    link: {
        main: "#28a745"
    },
    primary: {
      main: '#2b6c7d',
      contrastText: '#d0d8c6',
    },
    secondary: {
      main: 'rgba(175,199,82,0.7)',
      contrastText: '#d2d4c2',
    },
    error: {
      main: '#de6f64',
    },
    success: {
      main: '#6dd072',
    },
};

const paletteLightMode = {
    mode: 'light',
    link: {
        main: "#28a745"
    },
    primary: {
      main: '#568e98',
      contrastText: '#cdd8c2',
    },
    secondary: {
      main: '#afc752',
      contrastText: '#fdfde6',
    },
    error: {
      main: '#de6f64',
    },
    success: {
      main: '#6dd072',
      contrastText: '#dbffdf'
    },
}

const CustomThemeProvider = ({children}) => {
    
    const { darkMode } = useDarkMode();

    const theme = React.useMemo(
        () => responsiveFontSizes(
            createTheme({
                palette: darkMode ? paletteDarkMode : paletteLightMode,
                pageWidth: {
                    maxWidth: '800px',
                    width: '98%'
                },
                components: {
                    MuiTooltip: {
                        styleOverrides: {
                            tooltip: {
                                fontSize: "16px",
                                backgroundColor: "black"
                            },
                            arrow: {
                                color: "black"
                            }
                        }
                    }
                }
            }),
            { factor: 3 }
        ),
        [darkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
};

export default CustomThemeProvider;


