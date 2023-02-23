import React, { useRef } from 'react';
import { Box } from '@mui/system';
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import Switch from "@mui/material/Switch";
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import LazyImage from "../lazyImage";
import ReCAPTCHA from "react-google-recaptcha";
import { LocationsMap } from '../map';

import {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_NUMBER,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_URL,
    FIELD_TYPE_CHECK_BOX,
    FIELD_TYPE_SELECT,
    FIELD_TYPE_SWITCH,
    FIELD_TYPE_DATE,
    FIELD_TYPE_PASSWORD,
    FIELD_TYPE_LATLONG,
    FIELD_TYPE_CAPTCHA
} from './Form';

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateValueRange(value, range) {
    if (value === undefined || value === null || isNaN(value)) {
        return false;
    }

    if (value < range.min || value > range.max) {
        return false;
    }

    return true;
}

function validateFieldValue(field, fieldValue) {
    let isError = false;
    if (typeof fieldValue === "string") {
        const isEmpty = fieldValue.trim().length === 0;
        if (field.type === FIELD_TYPE_EMAIL) {
            isError = (isEmpty === false && !validateEmail(fieldValue)) || (field.required && isEmpty === true);
        } else {
            isError = field.required && isEmpty === true;
        }
    } else if (fieldValue === undefined || fieldValue === null || isNaN(fieldValue)) {
        isError = field.required;
    } else if (field.range) {
        isError = validateValueRange(fieldValue, field.range) === false;
    }
    return !isError;
}

const useOptions = (field, values) => {
    //const { options, error } = React.useMemo(() => {
        let options = null;
        let error = null;
        try {
            options = field.options(field.dependsOn !== undefined ? field.dependsOn.map(dependency => values[dependency] ) : null);
        } catch (err) {
            error = err.message;
        }
        return {
            options,
            error
        }
    /*}, [field, values])
    return {
        options,
        error
    };*/
};

const SelectControl = ({field, value, values, handleChange, sending, readOnly, validators}) => {

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

    const [ selectedValue, setSelectedValue ] = React.useState("");

    React.useEffect(() => {
        if (options !== null && options !== undefined && value !== null && value !== undefined && value !== '') {
            const selectedOption = options.find(option => option[valueProperty] === value)
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
                    }
                }
            >
            {
                options ?
                options.map(option => (
                    <MenuItem key={option[keyProperty]} value={option} sx={{pv: 0}}>
                        {
                            option.src ?
                            <LazyImage
                                image={option}
                                width={200}
                                withOverlay={false}
                                withFavorite={false}
                            /> :
                            field.optionComponent ?
                            <field.optionComponent option={option} /> :
                            option[captionProperty]
                        }
                    </MenuItem>)) :
                null
            }
            </Select>
            { error && <FormHelperText>{error}</FormHelperText> }
        </FormControl>
    )
}

const CheckBoxField = ({field, value, handleChange, sending, readOnly, validators}) => {
    const onChange = React.useCallback((event) => {
        handleChange(field, event.target.checked);
    }, [field, handleChange]);

    React.useEffect(() => {
        validators[field.id] = (value) => true;
    }, [field, validators]);

    return (
        <FormControl fullWidth>
            <FormControlLabel
                control={
                    <Checkbox
                        id={field.id}
                        checked={value ?? false}
                        disabled={sending || readOnly || field.readOnly}
                        onChange={onChange}
                    />
                }
                label={field.label} />
        </FormControl>
    );
};

const SwitchField = ({ field, value, handleChange, sending, readOnly, validators}) => {
    const onChange = React.useCallback((event) => {
        handleChange(field, event.target.checked);
    }, [field, handleChange]);

    React.useEffect(() => {
        validators[field.id] = (value) => true;
    }, [field, validators]);
    return (
        <FormControl fullWidth>
            <FormControlLabel
                sx={{
                    justifyContent: 'flex-start'
                }}
                control={
                    <Switch
                        onChange={onChange}
                        id={field.id}
                        color="primary"
                        checked={value ?? false}
                        disabled={sending || readOnly || field.readOnly}
                />}
                label={field.label}
            />
        </FormControl>
    );
}

const GenericTextField = ({ field, value, values, handleChange, sending, readOnly, inputProps = { }, validators}) => {

    const [error, setError] = React.useState(false);

    const onChange = React.useCallback((event) => {
        const fieldValue =
            field.type === FIELD_TYPE_NUMBER ?
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
            }}
        />
    )
}

const getLatLongFieldTemplate = () => {
    return {
        type: FIELD_TYPE_NUMBER,
        step: 0.0001,
        multiline: false,
        default: 0.0
    }
}

const _latitudeRange = { min: -90.0, max: 90.0 };
const _longitudeRange = { min: -180.0, max: 180.0 };
const initializeLocation = (value) => {
    if (value === null || value === undefined) {
        return null;/*{
            latitude: null,
            longitude: null
        }*/
    } else {
        return { ...value };
    }
}

const LatLongField = ({field, value, values, handleChange, sending, readOnly, validators}) => {
    const [location, setLocation] = React.useState(null);
    const locationSource = React.useRef(null);

    const latLongFieldBase = React.useRef({
        required: field.required,
        readOnly: field.readOnly,
        ...getLatLongFieldTemplate()
    });

    const latitudeField = React.useRef({
        label: "latitude",
        id: `${field.id}::latitude`,
        key: "latitude",
        errorText: `Veuillez spécifier une latitude valide comprise entre ${_latitudeRange.min} et ${_latitudeRange.max}`,
        range: { ..._latitudeRange },
        ...latLongFieldBase.current
    });

    const longitudeField = React.useRef({
        label: "longitude",
        id: `${field.id}::longitude`,
        key: "longitude",
        errorText: `Veuillez spécifier une longitude valide comprise entre ${_longitudeRange.min} et ${_longitudeRange.max}.`,
        range: { ..._longitudeRange },
        ...latLongFieldBase.current
    });

    React.useEffect(() => {
        setLocation(initializeLocation(value));
    }, [value]);

    React.useEffect(() => {
        if (locationSource.current === "input") {
            handleChange(field, location);
        }
        locationSource.current = null;
    }, [location, field, handleChange]);

    const onInputChange = React.useCallback((singleField, newValue) => {
        locationSource.current = "input";
        setLocation(prevValue => {
            return {
                ...(prevValue && prevValue),
                [singleField.key]: newValue
            };
        });
    }, []);

    React.useEffect(() => {
        validators[field.id] = (value) => {
            return value !== null && value !== undefined &&
                   validateValueRange(value.latitude, _latitudeRange) &&
                   validateValueRange(value.longitude, _longitudeRange);
        }
    }, [field, validators]);

    const onMapClick = React.useCallback((position) => {
        locationSource.current = "input";
        setLocation({
            latitude: position.lat,
            longitude: position.lng
        });
    }, []);

    return (
        <React.Fragment>
            <GenericTextField
                field={latitudeField.current}
                value={location?.latitude}
                sending={sending}
                readOnly={readOnly}
                handleChange={onInputChange}
                inputProps={{
                    min: latitudeField.current.range.min,
                    max: latitudeField.current.range.max
                }}
            />
            <GenericTextField
                field={longitudeField.current}
                value={location?.longitude}
                sending={sending}
                readOnly={readOnly}
                handleChange={onInputChange}
                inputProps={{
                    min: longitudeField.current.range.min,
                    max: longitudeField.current.range.max
                }}
            />
            <Box sx={{height: "200px", width: "100%"}}>
                <LocationsMap locations={location} resetOnChange={false} onMapClick={onMapClick} />
            </Box>
        </React.Fragment>
    )

}

const validateCaptcha = (value) => {
    return value !== null;
};

const CaptchaField = ({ field, value, values, handleChange, sending, validators}) => {

    const onCaptchaChange = React.useCallback((value) => {
        handleChange(field, value);
    }, [handleChange, field]);

    React.useEffect(() => {
        validators[field.id] = validateCaptcha;
    }, [field, validators]);

    return (
        <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            onChange={onCaptchaChange}
        />
    )
}

export const FormField = (props) => {
    
    const FormFields = useRef({
        [FIELD_TYPE_SWITCH]: SwitchField,
        [FIELD_TYPE_CHECK_BOX]: CheckBoxField,
        [FIELD_TYPE_SELECT]: SelectControl,
        [FIELD_TYPE_TEXT]: GenericTextField,
        [FIELD_TYPE_NUMBER]: GenericTextField,
        [FIELD_TYPE_EMAIL]: GenericTextField,
        [FIELD_TYPE_URL]: GenericTextField,
        [FIELD_TYPE_DATE]: GenericTextField,
        [FIELD_TYPE_PASSWORD]: GenericTextField,
        [FIELD_TYPE_LATLONG]: LatLongField,
        [FIELD_TYPE_CAPTCHA]: CaptchaField
    });

    const { field } = props;
    const FieldComponent = FormFields.current[field.type];
    return <FieldComponent {...props} />
};
