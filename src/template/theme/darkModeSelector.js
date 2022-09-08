import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Tooltip from '@mui/material/Tooltip';
import { useDarkMode } from './darkModeProvider';

const DARK_MODE = "dark";
const LIGHT_MODE = "light";

const modeFromDarkMode = (darkMode) => {
    return darkMode === true ? DARK_MODE : LIGHT_MODE;
}

const DarkModeSelector = () => {

    const { darkMode, systemDarkMode, setDarkMode } = useDarkMode();
    const [mode, setMode] = useState(() => modeFromDarkMode(darkMode));

    const handleChangeMode = useCallback((event, newMode) => {
        if (newMode !== null) {
            setMode(newMode);
            setDarkMode(
                newMode === DARK_MODE ? true :   // Force dark mode
                false                            // force light mode
            )
        }
    }, [setDarkMode]);

    useEffect(() => {
        setMode(modeFromDarkMode(darkMode));
    }, [darkMode])

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                flex: 1
            }}
        >
            <ToggleButtonGroup exclusive value={mode} onChange={handleChangeMode} >
                <ToggleButton value={LIGHT_MODE} >
                    <Tooltip title={`Clair${systemDarkMode === false ? " (Système)" : ""}`}>
                        <LightModeIcon />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value={DARK_MODE} >
                    <Tooltip title={`Sombre${systemDarkMode === true ? " (Système)" : ""}`}>
                        <DarkModeIcon />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}

export default DarkModeSelector;