import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Stack } from '@mui/material';
import { useAuthContext } from 'components/authentication';
import { useTranslation } from 'utils';

export const defaultSettings = {
    exact: true,
    fuzzy: true
};

// export const getSettingsFromQueryParameters = (getParameterFn) => {
//     const exact = getParameterFn("exact");
//     const fuzzy = getParameterFn("fuzzy");
//     return {
//         exact: (exact === 'true'),
//         fuzzy: (fuzzy === 'true')
//     };
// }

const SearchSettings = ({
    settings = defaultSettings,
    onChange
}) => {
    const t = useTranslation("components.search");
    const authContext = useAuthContext();

    // If the user selects "exact" search, we should disable "fuzzy" search, and vice versa.
    const onChangeExact = React.useCallback((event) => {
        const exact = event.target.checked;
        if (onChange && settings.exact !== exact) {
            onChange({
                ...settings,
                exact
            });
        }
    }, [onChange, settings]);

    const onChangeFuzzy = React.useCallback((event) => {
        const fuzzy = event.target.checked;
        if (onChange && settings.fuzzy !== fuzzy) {
            onChange({
                ...settings,
                fuzzy
            });
        }
    }, [onChange, settings]);

    return (
        <Stack direction="row" spacing={2}>
            <FormControlLabel
                control={
                    <Switch
                        checked={settings.exact}
                        onChange={onChangeExact}
                        name="checkedExact"
                    />}
                label={t("exactSwitch")}
            />
            { /* Display the "fuzzy" switch for the admin user only so far */ }
            {
                authContext.admin &&
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.fuzzy}
                            onChange={onChangeFuzzy}
                            name="checkedFuzzy"
                        />}
                    label={t("fuzzySwitch")}
                />
            }
        </Stack>
    );
};

export default SearchSettings;