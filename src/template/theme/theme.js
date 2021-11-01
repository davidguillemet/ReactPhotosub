import { createTheme, responsiveFontSizes, adaptV4Theme } from '@mui/material/styles';

const theme = createTheme(adaptV4Theme({
    pageWidth: {
        maxWidth: '800px',
        width: '98%'
    }
}));

export default responsiveFontSizes(theme, { factor: 3 });