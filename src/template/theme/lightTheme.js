import { createTheme } from '@mui/material/styles';
import { isMobile } from 'react-device-detect';

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
        paper: '#fefdfd',
        paperLight: '#f4f0ea'
    }
};

export const lightTheme = createTheme({
    palette: paletteLightMode,
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
                color: "secondary",
                size: isMobile ? "small" : "medium"
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                    },
                }),
            },
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
        MuiInputBase: {
            defaultProps: {
                size: isMobile ? "small" : "medium"
            }
        },
        MuiInputLabel: {
            defaultProps: {
                size: isMobile ? "small" : "medium"
            },
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
        },
        // MuiStack: {
        //     defaultProps: {
        //         useFlexGap: true
        //     }
        // },
    }
});
