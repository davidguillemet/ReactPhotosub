import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';

const CheckBoxField = ({ field, value, handleChange, sending, readOnly, validators }) => {
    const onChange = React.useCallback((event) => {
        handleChange(field, event.target.checked);
    }, [field, handleChange]);

    React.useEffect(() => {
        validators[field.id] = (value) => true;
    }, [field, validators]);

    return (
        <FormControl fullWidth>
            <FormControlLabel
                control={<Checkbox
                    id={field.id}
                    checked={value ?? false}
                    disabled={sending || readOnly || field.readOnly}
                    onChange={onChange} />}
                label={field.label} />
        </FormControl>
    );
};

export default CheckBoxField;