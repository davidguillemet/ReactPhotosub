import React from 'react';
import TextField from '@mui/material/TextField';
import { FIELD_TYPE_NUMBER, FIELD_TYPE_PASSWORD, FIELD_TYPE_PASSWORD_CONFIRM } from '../FormContext';
import { validateFieldValue } from './common';
import { useFormContext } from '../FormContext';
import InputAdornment from '@mui/material/InputAdornment';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

const GenericTextFieldComp = ({
    fieldSpec,
    value,
    handleChange,
    inputProps = {},
    group = false,
    hasError}) => {

    const formContext = useFormContext();

    const onChange = React.useCallback((event) => {
        const field = fieldSpec.field;
        const fieldValue = field.type === FIELD_TYPE_NUMBER ?
            event.target.valueAsNumber :
            event.target.value;
        handleChange(fieldSpec, fieldValue);
    }, [fieldSpec, handleChange]);

    const field = fieldSpec.field;
    const fieldType =
        field.type === FIELD_TYPE_PASSWORD_CONFIRM ? FIELD_TYPE_PASSWORD :
        field.type;

    const error = hasError !== undefined ? hasError : formContext.hasError(fieldSpec.id);

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
            type={fieldType}
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
