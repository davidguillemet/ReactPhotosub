import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormControl from '@mui/material/FormControl';
import { useFormContext } from '../FormContext';

const validateSwitchField = (_fieldSpec, _value) => true;

const SwitchFieldComp = ({ fieldSpec, value, handleChange }) => {
    const formContext = useFormContext();

    const onChange = React.useCallback((event) => {
        const value = event.target.checked;
        handleChange(fieldSpec, value);
    }, [fieldSpec, handleChange]);

    const field = fieldSpec.field;
 
    return (
        <FormControl fullWidth>
            <FormControlLabel
                sx={{
                    justifyContent: 'flex-start'
                }}
                control={<Switch
                    onChange={onChange}
                    id={field.id}
                    checked={value ?? false}
                    disabled={formContext.sending || formContext.readOnly || field.readOnly} />}
                label={field.label} />
        </FormControl>
    );
};

const SwitchField = [ SwitchFieldComp, validateSwitchField ];
export default SwitchField;