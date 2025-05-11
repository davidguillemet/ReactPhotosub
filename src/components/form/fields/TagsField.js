import React from 'react';
import TextField from '@mui/material/TextField';
import { Chip, Autocomplete } from '@mui/material';
import { useFormContext } from '../FormContext';

const validateTagsFieldValue = (_fieldSpec, value) => {
    return Array.isArray(value) && value.length > 0;
};

const TagsFieldComp = ({ fieldSpec, value, handleChange }) => {
    const formContext = useFormContext();

    const [inputValue, setInputValue] = React.useState("");

    const onChange = React.useCallback((event, newValue) => {
        handleChange(fieldSpec, newValue);
    }, [fieldSpec, handleChange]);

    const field = fieldSpec.field;
    const isReadOnly = formContext.sending || formContext.readOnly || field.readOnly;

    const error = formContext.hasError(field.id);

    return (
        <Autocomplete
            disableClearable={isReadOnly}
            disabled={isReadOnly}
            fullWidth
            freeSolo
            multiple
            options={[]}
            noOptionsText=""
            defaultValue={[]}
            renderInput={({disabled, ...params}) => (
                <TextField
                    {...params}
                    label={field.label}
                    placeholder={isReadOnly ? "" : "Ajouter un tag"}
                    helperText={error ? field.errorText : ''}
                    error={error}
                    readOnly={isReadOnly}
                    disabled={isReadOnly} />
            )}
            renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => {
                return <Chip variant="outlined" label={option} {...getTagProps({ index })} disabled={isReadOnly} />;
            })}
            onChange={onChange}
            value={value || []}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                const options = newInputValue.split(",");
                if (options.length > 1) {
                    const newTagList = value
                        .concat(options)
                        .map(x => x.trim())
                        .filter(x => x);
                    // Remove possible duplicates
                    onChange(null, [...new Set(newTagList)]);
                    setInputValue("");
                } else {
                    setInputValue(newInputValue);
                }
            }} />
    );
};

const TagsField = [ TagsFieldComp, validateTagsFieldValue ];
export default TagsField;
