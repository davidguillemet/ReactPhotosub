import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import { useFormContext } from '../FormContext';

const validateCheckBox = (_field, _value) => true;

const CheckBoxFieldComp = ({ field, value, handleChange }) => {
    const formContext = useFormContext();

    const onChange = React.useCallback((event) => {
        handleChange(field, event.target.checked);
    }, [field, handleChange]);

    return (
        <FormControl fullWidth>
            <FormControlLabel
                control={<Checkbox
                    id={field.id}
                    checked={value ?? false}
                    disabled={formContext.sending || formContext.readOnly || field.readOnly}
                    onChange={onChange} />}
                label={field.label} />
        </FormControl>
    );
};

const CheckBoxField = [ CheckBoxFieldComp, validateCheckBox ];
export default CheckBoxField;