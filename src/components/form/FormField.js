import { useRef } from 'react';
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from '@mui/material/Checkbox';
import Switch from "@mui/material/Switch";
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LazyImage from "../lazyImage";

import {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_CHECK_BOX,
    FIELD_TYPE_SELECT,
    FIELD_TYPE_SWITCH,
    FIELD_TYPE_DATE,
    FIELD_TYPE_PASSWORD
} from './Form';

const SelectControl = ({field, value, values, handleChange, sending, readOnly}) => {

    // TODO : don't call field.options on each render...
    const options = field.options(field.dependsOn ? field.dependsOn.map(dependency => values[dependency] ) : null);

    const valueProperty = field.mapping ? field.mapping["value"] : "id";
    const captionProperty = field.mapping ? field.mapping["caption"] : "title";
    const keyProperty = field.mapping ? field.mapping["key"] : "id";

    return (
        <FormControl fullWidth>
            <InputLabel id="select-label">{field.Label}</InputLabel>
            <Select
                labelId="select-label"
                name={field.id}
                value={options !== undefined ? value : ""}
                label={field.label}
                onChange={handleChange}
                fullWidth
                disabled={sending || readOnly || field.readOnly}
            >
            {
                options ?
                options.map(option => (
                    <MenuItem key={option[keyProperty]} value={option[valueProperty]}>
                        {
                            option.src ?
                            <LazyImage
                                image={option}
                                width={200}
                                withOverlay={false}
                                withFavorite={false}
                            />
                            :
                            option[captionProperty]
                        }
                    </MenuItem>)) :
                null
            }
            </Select>
        </FormControl>
    )
}

const CheckBoxField = ({field, value, handleChange, sending, readOnly}) => {
    return (
        <FormControl fullWidth>
            <FormControlLabel
                control={
                    <Checkbox
                        id={field.id}
                        checked={value}
                        disabled={sending || readOnly || field.readOnly}
                        onChange={handleChange}
                    />
                }
                label={field.label} />
        </FormControl>
    );
};

const SwitchField = ({ field, value, handleChange, sending, readOnly }) => {
    return (
        <FormControl fullWidth>
            <FormControlLabel
                sx={{
                    justifyContent: 'flex-start'
                }}
                control={
                    <Switch
                        onChange={handleChange}
                        id={field.id}
                        color="primary"
                        checked={value}
                        disabled={sending || readOnly || field.readOnly}
                />}
                label={field.label}
            />
        </FormControl>
    );
}

const GenericTextField = ({ field, value, values, handleChange, sending, readOnly }) => {
    return (
        <TextField
            key={field.id}
            id={field.id}
            label={field.label}
            value={value}
            variant="outlined"
            fullWidth
            margin="normal"
            required={field.required}
            type={field.type}
            multiline={field.multiline}
            minRows="10"
            onChange={handleChange}
            error={field.error}
            helperText={field.error ? field.errorText : ''}
            disabled={sending || readOnly || field.readOnly}
            InputLabelProps={{
                shrink: true
            }}
        />
    )
}

const FormField = (props) => {
    
    const FormFields = useRef({
        [FIELD_TYPE_SWITCH]: SwitchField,
        [FIELD_TYPE_CHECK_BOX]: CheckBoxField,
        [FIELD_TYPE_SELECT]: SelectControl,
        [FIELD_TYPE_TEXT]: GenericTextField,
        [FIELD_TYPE_EMAIL]: GenericTextField,
        [FIELD_TYPE_DATE]: GenericTextField,
        [FIELD_TYPE_PASSWORD]: GenericTextField
    });

    const { field } = props;
    const FieldComoponent = FormFields.current[field.type];
    return <FieldComoponent {...props} />
};

export default FormField;
