import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { useTranslation } from 'utils';

export const defaultSettings = {
    exact: false
};

export const getSettingsFromQueryParameters = (getParameterFn) => {
    const exact = getParameterFn("exact");
    return {
        exact: (exact === 'true')
    };
}

const SearchSettings = ({
    settings = defaultSettings,
    onChange
}) => {
    const t = useTranslation("components.search");

    const onChangeExact = React.useCallback((event) => {
        const exact = event.target.checked;
        if (onChange && settings.exact !== exact) {
            onChange({
                ...settings,
                exact
            });
        }
    }, [onChange, settings]);

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={settings.exact}
                    onChange={onChangeExact}
                    name="checkedExact"
                    color="primary"
                />}
             label={t("exactSwitch")}
        />
    );
};

export default SearchSettings;