import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
    pageWidth: {
        maxWidth: '800px',
        width: '98%'
    }
});

export default responsiveFontSizes(theme, { factor: 3 });