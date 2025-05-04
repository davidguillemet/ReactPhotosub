import React from 'react';
import TextField from '@mui/material/TextField';
import { FIELD_TYPE_NUMBER } from '../Form';
import { validateFieldValue } from './common';
import { useFormContext } from '../FormContext';
import InputAdornment from '@mui/material/InputAdornment';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

const GenericTextFieldComp = ({
    field,
    value,
    handleChange,
    inputProps = {},
    group = false}) => {

    const formContext = useFormContext();

    const [error, setError] = React.useState(false);
    const changed = React.useRef(false);

    const checkFieldValue = React.useCallback((event) => {
        const fieldValue = field.type === FIELD_TYPE_NUMBER ?
            event.target.valueAsNumber :
            event.target.value;
        const valid = field.validator ? field.validator(field, fieldValue) : validateFieldValue(field, fieldValue);
        setError(!valid);
        return fieldValue;
    }, [field])

    const onChange = React.useCallback((event) => {
        changed.current = true;
        const fieldValue = checkFieldValue(event);
        handleChange(field, fieldValue);
    }, [field, checkFieldValue, handleChange]);

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
                },
                input: {
                    // Prevents the dialog being closed on mobile: two clicks on "cancel" are required!
                    // onBlur: checkFieldValue,
                    endAdornment: error ?
                        <InputAdornment position="end">
                            <ErrorOutlinedIcon color="error" />
                        </InputAdornment> : null
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
