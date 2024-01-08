import React from 'react';
import TextField from '@mui/material/TextField';
import { Chip, Autocomplete } from '@mui/material';

const validateTagsFieldValue = (value) => {
    return Array.isArray(value) && value.length > 0;
};

const TagsField = ({ field, value, values, handleChange, sending, readOnly, inputProps = {}, validators }) => {

    const [error, setError] = React.useState(false);
    const [tagList, setTagList] = React.useState([]);
    const [inputValue, setInputValue] = React.useState("");

    React.useEffect(() => {
        if (value !== undefined) {
            setTagList(value);
        }
    }, [value]);

    React.useEffect(() => {
        const isError = !validateTagsFieldValue(tagList);
        setError(isError);
        if (handleChange) {
            handleChange(field, tagList);
        }
    }, [tagList, field, handleChange]);

    React.useEffect(() => {
        if (validators !== undefined) {
            validators[field.id] = validateTagsFieldValue;
        }
    }, [field, validators]);

    const onChange = (event, newValue) => {
        setTagList(newValue);
    };

    return (
        <Autocomplete
            fullWidth
            freeSolo
            multiple
            options={[]}
            noOptionsText=""
            defaultValue={[]}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={field.label}
                    placeholder="Ajouter un tag"
                    helperText={error ? field.errorText : ''}
                    error={error} />
            )}
            renderTags={(tagValue, getTagProps) => tagValue.map((option, index) => {
                return <Chip variant="outlined" label={option} {...getTagProps({ index })} />;
            })}
            onChange={onChange}
            value={tagList}
            inputValue={inputValue}
            readOnly={sending || readOnly || field.readOnly}
            onInputChange={(event, newInputValue) => {
                const options = newInputValue.split(",");
                if (options.length > 1) {
                    const newTagList = tagList
                        .concat(options)
                        .map(x => x.trim())
                        .filter(x => x);
                    // Remove possible duplicates
                    setTagList([...new Set(newTagList)]);
                    setInputValue("");
                } else {
                    setInputValue(newInputValue);
                }
            }} />
    );
};

export default TagsField;
