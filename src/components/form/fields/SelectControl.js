import React from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LazyImage from "../../lazyImage";
import { validateFieldValue } from './common';
import { useFormContext } from '../FormContext';

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

const SelectControlComp = ({ fieldSpec, value, handleChange }) => {

    const field = fieldSpec.field;
    const formContext = useFormContext();
    const valueProperty = React.useMemo(() => field.mapping ? field.mapping["value"] : "id", [field]);
    const captionProperty = React.useMemo(() => field.mapping ? field.mapping["caption"] : "title", [field]);
    const keyProperty = React.useMemo(() => field.mapping ? field.mapping["key"] : "id", [field]);

    const onChange = React.useCallback((event) => {
        const fieldValue = event.target.value;
        const value = fieldValue[valueProperty];
        handleChange(fieldSpec, value);
        setSelectedValue(fieldValue);
    }, [fieldSpec, handleChange, valueProperty]);

    const { options, error } = useOptions(field, formContext.values);

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
    const fieldLabel = `${field.label}${field.required ? ' *' : ''}`;

    return (
        <FormControl fullWidth error={error !== null}>
            <InputLabel id="select-label">{fieldLabel}</InputLabel>
            <Select
                labelId="select-label"
                name={field.id}
                value={options !== null && options !== undefined ? selectedValue : ''}
                label={fieldLabel}
                required={field.required}
                onChange={onChange}
                fullWidth
                disabled={formContext.sending || formContext.readOnly || field.readOnly || !hasOptions}
                renderValue={(selected) => {
                    return field.getCaption ? field.getCaption(selected) : selected[captionProperty];
                }}
            >
                {
                    options &&
                    options.map(option => (
                        <MenuItem key={option[keyProperty]} value={option} sx={{ py: 0 }}>
                            {option.src ?
                                <LazyImage
                                    image={option}
                                    width={200}
                                    withOverlay={false}
                                    withFavorite={false} /> :
                                field.optionComponent ?
                                    <field.optionComponent option={option} /> :
                                    field.getCaption ? field.getCaption(option) :
                                    option[captionProperty]}
                        </MenuItem>))
                }
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
    );
};

const SelectControl = [ SelectControlComp, validateFieldValue ];
export default SelectControl;