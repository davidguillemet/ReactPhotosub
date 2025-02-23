import React from 'react';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { useDarkMode } from 'components/theme';

const paletteDarkMode = {
    mode: 'dark',
    link: {
        main: "#236fc0"
    },
    primary: {
      main: '#121212',
      contrastText: '#d0d8c6',
    },
    secondary: {
      main: 'rgba(175,199,82,0.7)',
      contrastText: '#d2d4c2',
    },
    error: {
      main: '#de6f64',
    },
    warning: {
      main: '#ffe0b2',
    },
    success: {
      main: '#6dd072',
    },
    text: {
        primary: '#bcd1e6'
    }
};

const paletteLightMode = {
    mode: 'light',
    link: {
        main: '#236fc0'
    },
    primary: {
      main: '#fbf7f3',
      contrastText: '#5f5f4c',
    },
    secondary: {
      main: '#79a2b2',
      contrastText: '#eeeeee',
    },
    error: {
      main: 'rgb(218, 112, 112)',
    },
    info: {
      main: '#8ebdde',
    },
    warning: {
      main: '#e4c18c',
    },
    success: {
      main: 'rgb(153, 219, 153)',
      contrastText: 'rgb(30, 70, 32)'
    },
    text: {
        primary: '#5f5f4c'
    },
    background: {
        paper: '#fefdfd'
    }
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
                    MuiCircularProgress: {
                        defaultProps: {
                            color: 'secondary'
                        }
                    },
                    MuiCheckbox: {
                        defaultProps: {
                            color: "secondary"
                        }
                    },
                    MuiSwitch: {
                        defaultProps: {
                            color: "secondary"
                        }
                    },
                    MuiButton: {
                        defaultProps: {
                            variant: "outlined",
                            color: "secondary"
                        }
                    },
                    MuiLoadingButton: {
                        defaultProps: {
                            variant: "outlined",
                            color: "secondary"
                        }
                    },
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
                    },
                    MuiInputLabel: {
                        styleOverrides: {
                            root: ({theme}) => ({
                                "&.Mui-focused": {
                                    color: theme.palette.secondary.dark
                                }
                            })
                        }
                    },
                    MuiOutlinedInput: {
                        styleOverrides: {
                            root: ({ theme }) => ({
                                "&.Mui-focused": {
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderWidth: '1px',
                                        borderColor: theme.palette.secondary.dark,
                                        borderStyle: 'solid'
                                    }
                                }
                            })
                        }
                    },
                    MuiLink: {
                        defaultProps: {
                            color: "secondary"
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


