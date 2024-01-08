import React from 'react';
import TextField from '@mui/material/TextField';
import { FIELD_TYPE_NUMBER } from '../Form';
import { validateFieldValue } from './common';

const GenericTextField = ({ field, value, values, handleChange, sending, readOnly, inputProps = {}, validators }) => {

    const [error, setError] = React.useState(false);

    const onChange = React.useCallback((event) => {
        const fieldValue = field.type === FIELD_TYPE_NUMBER ?
            event.target.valueAsNumber :
            event.target.value;
        handleChange(field, fieldValue);
        const valid = validateFieldValue(field, fieldValue);
        setError(!valid);
    }, [field, handleChange]);

    React.useEffect(() => {
        if (validators !== undefined) {
            validators[field.id] = (value) => validateFieldValue(field, value);
        }
    }, [field, validators]);

    return (
        <TextField
            key={field.id}
            id={field.id}
            label={field.label}
            value={value ?? ''}
            autoFocus={field.focus}
            variant="outlined"
            fullWidth
            margin="normal"
            required={field.required}
            type={field.type}
            inputProps={{
                step: field.step,
                ...inputProps
            }}
            multiline={field.multiline}
            minRows="10"
            onChange={onChange}
            error={error}
            helperText={error ? field.errorText : ''}
            disabled={sending || readOnly || field.readOnly}
            InputLabelProps={{
                shrink: true
            }} />
    );
};

export default GenericTextField;
