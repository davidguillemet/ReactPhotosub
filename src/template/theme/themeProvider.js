import ResponsiveTheme from './theme';
import { ThemeProvider } from '@mui/material/styles';

const CustomThemeProvider = ({children}) => {
    return (
        <ThemeProvider theme={ResponsiveTheme}>
            {children}
        </ThemeProvider>
    )
};

export default CustomThemeProvider;


