import React from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import { useFormContext } from '../FormContext';

const validateCheckBox = (_field, _value) => true;

const CheckBoxFieldComp = ({ fieldSpec, value, handleChange }) => {
    const formContext = useFormContext();

    const onChange = React.useCallback((event) => {
        handleChange(fieldSpec, event.target.checked);
    }, [fieldSpec, handleChange]);

    const field = fieldSpec.field;

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