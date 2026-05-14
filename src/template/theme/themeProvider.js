import React from 'react';
import { responsiveFontSizes } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { useDarkMode } from 'components/theme';
import deepOceanTheme from './deepOceanTheme';
import lightTheme from './lightTheme';

const CustomThemeProvider = ({ children }) => {

    const { darkMode } = useDarkMode();

    const theme = React.useMemo(
        () => responsiveFontSizes(darkMode ? deepOceanTheme : lightTheme, { factor: 3 }),
        [darkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
};

export default CustomThemeProvider;


