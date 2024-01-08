import React from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LazyImage from "../../lazyImage";
import { validateFieldValue } from './common';

const useOptions = (field, values) => {
    //const { options, error } = React.useMemo(() => {
    let options = null;
    let error = null;
    try {
        options = field.options(field.dependsOn !== undefined ? field.dependsOn.map(dependency => values[dependency]) : null);
    } catch (err) {
        error = err.message;
    }
    return {
        options,
        error
    };
    /*}, [field, values])
    return {
        options,
        error
    };*/
};

const SelectControl = ({ field, value, values, handleChange, sending, readOnly, validators }) => {

    const valueProperty = React.useMemo(() => field.mapping ? field.mapping["value"] : "id", [field]);
    const captionProperty = React.useMemo(() => field.mapping ? field.mapping["caption"] : "title", [field]);
    const keyProperty = React.useMemo(() => field.mapping ? field.mapping["key"] : "id", [field]);

    const onChange = React.useCallback((event) => {
        const fieldValue = event.target.value;
        handleChange(field, fieldValue[valueProperty]);
        setSelectedValue(fieldValue);
    }, [field, handleChange, valueProperty]);

    React.useEffect(() => {
        validators[field.id] = (value) => validateFieldValue(field, value);;
    }, [field, validators]);

    const { options, error } = useOptions(field, values);

    const [selectedValue, setSelectedValue] = React.useState("");

    React.useEffect(() => {
        if (options !== null && options !== undefined && value !== null && value !== undefined && value !== '') {
            const selectedOption = options.find(option => option[valueProperty] === value);
            setSelectedValue(selectedOption);
        } else {
            setSelectedValue('');
        }
    }, [value, options, valueProperty]);

    const hasOptions = options !== null && options !== undefined;

    return (
        <FormControl fullWidth error={error !== null}>
            <InputLabel id="select-label">{`${field.label} *`}</InputLabel>
            <Select
                labelId="select-label"
                name={field.id}
                value={options !== null && options !== undefined ? selectedValue : ''}
                label={`${field.label} *`}
                required={field.required}
                onChange={onChange}
                fullWidth
                disabled={sending || readOnly || field.readOnly || !hasOptions}
                renderValue={(selected) => {
                    return selected[captionProperty];
                }}
            >
                {options ?
                    options.map(option => (
                        <MenuItem key={option[keyProperty]} value={option} sx={{ pv: 0 }}>
                            {option.src ?
                                <LazyImage
                                    image={option}
                                    width={200}
                                    withOverlay={false}
                                    withFavorite={false} /> :
                                field.optionComponent ?
                                    <field.optionComponent option={option} /> :
                                    option[captionProperty]}
                        </MenuItem>)) :
                    null}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    );
};

export default SelectControl;