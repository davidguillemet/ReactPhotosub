import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormControl from '@mui/material/FormControl';

const SwitchField = ({ field, value, handleChange, sending, readOnly, validators }) => {
    const onChange = React.useCallback((event) => {
        handleChange(field, event.target.checked);
    }, [field, handleChange]);

    React.useEffect(() => {
        validators[field.id] = (value) => true;
    }, [field, validators]);
    return (
        <FormControl fullWidth>
            <FormControlLabel
                sx={{
                    justifyContent: 'flex-start'
                }}
                control={<Switch
                    onChange={onChange}
                    id={field.id}
                    color="primary"
                    checked={value ?? false}
                    disabled={sending || readOnly || field.readOnly} />}
                label={field.label} />
        </FormControl>
    );
};

export default SwitchField;