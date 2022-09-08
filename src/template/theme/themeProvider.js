import React from 'react';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { useDarkMode } from './darkModeProvider';

const CustomThemeProvider = ({children}) => {
    
    const { darkMode } = useDarkMode();

    const theme = React.useMemo(
        () => responsiveFontSizes(
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    link: {
                        main: "#28a745"
                    }
                },
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


