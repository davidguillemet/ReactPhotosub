import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useDarkMode } from 'providers';
import { deepOceanTheme, lightTheme } from 'template/theme';

export const CustomThemeProvider = ({ children }) => {

    const { darkMode } = useDarkMode();

    const theme = React.useMemo(
        () => darkMode ? deepOceanTheme : lightTheme,
        [darkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    )
};
