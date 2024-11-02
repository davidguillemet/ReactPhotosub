import React, { useMemo } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useCallback } from 'react';
import { useLanguage } from "../../utils";
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';

function FrenchFlagIcon(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 32, height: 32 }} {...props} viewBox="0 0 32 32">
        {/* tslint:disable-next-line: max-line-length */}
        <path fill="#fff" d="M10 4H22V28H10z"></path>
        <path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#092050"></path>
        <path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#be2a2c"></path>
        <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path>
        <path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path>
    </SvgIcon>
  );
}

function EnglishFlagIcon(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 32, height: 32 }} {...props} viewBox="0 0 32 32">
        {/* tslint:disable-next-line: max-line-length */}
        <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#071b65"></rect>
        <path d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z" fill="#fff"></path>
        <path d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z" fill="#b92932"></path>
        <path d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z" fill="#b92932"></path>
        <path d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z" fill="#fff"></path>
        <rect x="13" y="4" width="6" height="24" fill="#fff"></rect>
        <rect x="1" y="13" width="30" height="6" fill="#fff"></rect>
        <rect x="14" y="4" width="4" height="24" fill="#b92932"></rect>
        <rect x="14" y="1" width="4" height="30" transform="translate(32) rotate(90)" fill="#b92932"></rect>
        <path d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z" fill="#b92932"></path>
        <path d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z" fill="#b92932"></path>
        <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path>
        <path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path>
    </SvgIcon>
  );
}

const FlagIcons = {
    "en": EnglishFlagIcon,
    "fr": FrenchFlagIcon
};

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
            value={language}
            onChange={handleChange}
            exclusive
        >
            {
                supportedLanguages.map(lang => {
                    const CountryIcon = FlagIcons[lang];
                    return (
                        <Tooltip title={languageNames.of(lang)} key={lang}>
                            <ToggleButton key={lang} value={lang} selected={lang === language}>
                                <CountryIcon />
                            </ToggleButton>
                        </Tooltip>
                    )
                })
            }
        </ToggleButtonGroup>
    );
}

export default LanguageSelector;