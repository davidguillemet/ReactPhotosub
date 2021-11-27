import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
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
});

export default responsiveFontSizes(theme, { factor: 3 });