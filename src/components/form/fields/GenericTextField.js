import React from 'react';
import TextField from '@mui/material/TextField';
import { FIELD_TYPE_NUMBER } from '../Form';
import { validateFieldValue } from './common';
import { useFormContext } from '../FormContext';

const GenericTextFieldComp = ({
    field,
    value,
    handleChange,
    inputProps = {},
    group = false}) => {

    const formContext = useFormContext();

    const [error, setError] = React.useState(false);

    const onChange = React.useCallback((event) => {
        const fieldValue = field.type === FIELD_TYPE_NUMBER ?
            event.target.valueAsNumber :
            event.target.value;
        const valid = validateFieldValue(field, fieldValue);
        setError(!valid);
        handleChange(field, fieldValue);
    }, [field, handleChange]);

    return (
        <TextField
            key={field.id}
            id={field.id}
            label={group === true ? "" : field.label}
            value={value ?? ''}
            autoFocus={field.focus}
            variant="outlined"
            fullWidth
            margin="normal"
            required={field.required}
            type={field.type}
            slotProps={{
                htmlInput: {
                    step: field.step,
                    min: field.min,
                    max: field.max,
                    ...inputProps
                },
                inputLabel: {
                    shrink: true
                }
            }}
            multiline={field.multiline}
            minRows={field.minRows || 10 }
            onChange={onChange}
            error={error}
            helperText={error ? field.errorText : ''}
            disabled={formContext.sending || formContext.readOnly || field.readOnly}
            sx={{
                ...(group === true && {
                '&.MuiFormControl-root': {
                    marginTop: 0
                }})
            }}
        />
    );
};

const GenericTextField = [ GenericTextFieldComp, validateFieldValue ];
export default GenericTextField;
