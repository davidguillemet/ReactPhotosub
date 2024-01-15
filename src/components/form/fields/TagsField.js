import React from 'react';
import TextField from '@mui/material/TextField';
import { Chip, Autocomplete } from '@mui/material';

const validateTagsFieldValue = (value) => {
    return Array.isArray(value) && value.length > 0;
};

const TagsField = ({ field, value, values, handleChange, sending, readOnly, inputProps = {}, validators }) => {

    const [error, setError] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    React.useEffect(() => {
        if (validators !== undefined) {
            validators[field.id] = validateTagsFieldValue;
        }
    }, [field, validators]);

    const onChange = (event, newValue) => {
        handleChange(field, newValue);
        const isError = !validateTagsFieldValue(newValue);
        setError(isError);
    };

    const isReadOnly = sending || readOnly || field.readOnly;

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
            value={value}
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

export default TagsField;
