import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { useTranslation } from 'utils';

const SearchSettings = ({config, onChangeExact}) => {
    const t = useTranslation("components.search");

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={config.exact}
                    onChange={onChangeExact}
                    name="checkedExact"
                    color="primary"
                />}
             label={t("exactSwitch")}
        />
    );
};

export default SearchSettings;