import { createTheme, responsiveFontSizes } from '@material-ui/core/styles';

const theme = createTheme({
    pageWidth: {
        maxWidth: '800px',
        width: '98%'
    }
});

export default responsiveFontSizes(theme);