import React, { useMemo } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useCallback } from 'react';
import { useLanguage } from "../../utils";

const LanguageSelector = () => {
    const { language, supportedLanguages, setLanguage } = useLanguage();
    const handleChange = useCallback((event, newLanguage) => {
        if (newLanguage) { // null if we click on the current language
            setLanguage(newLanguage);
        }
    }, [setLanguage]);

    const languageNames = useMemo(() => new Intl.DisplayNames([language], {type: 'language'}), [language]);

    if (process.env.REACT_APP_HANDLE_LANGUAGES === "false") {
        return null;
    }

    return (
        <ToggleButtonGroup
            size={"small"}
            color="primary"
            value={language}
            onChange={handleChange}
            exclusive
        >
            {
                supportedLanguages.map(lang => {
                    return (
                        <ToggleButton key={lang} value={lang}>{languageNames.of(lang)}</ToggleButton>
                    )
                })
            }
        </ToggleButtonGroup>
    );
}

export default LanguageSelector;