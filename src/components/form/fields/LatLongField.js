import React from 'react';
import { Box } from '@mui/system';
import { LocationsMapNative } from '../../map';
import { FIELD_TYPE_NUMBER } from '../Form';
import { useTranslation } from 'utils';
import { validateValueRange } from './common';
import GenericTextFieldProps from './GenericTextField';

const [ GenericTextField ] = GenericTextFieldProps;

const getLatLongFieldTemplate = () => {
    return {
        type: FIELD_TYPE_NUMBER,
        step: 0.0001,
        multiline: false,
        default: 0
    };
};
const _latitudeRange = { min: -90, max: 90 };
const _longitudeRange = { min: -180, max: 180 };
const initializeLocation = (value) => {
    if (value === null || value === undefined) {
        return null;
    } else {
        return { ...value };
    }
};

const validateLatLong = (_field, latLongValue) => {
    return latLongValue !== null && latLongValue !== undefined &&
        validateValueRange(latLongValue.latitude, _latitudeRange) &&
        validateValueRange(latLongValue.longitude, _longitudeRange);
};

const LatLongFieldComp = ({ field, value, handleChange }) => {

    const t = useTranslation("components.form");
    const [location, setLocation] = React.useState(null);
    const locationSource = React.useRef(null);

    const latLongFieldBase = React.useRef({
        required: field.required,
        readOnly: field.readOnly,
        ...getLatLongFieldTemplate()
    });

    const latitudeField = React.useRef({
        label: t("field:latitude"),
        id: `${field.id}::latitude`,
        key: "latitude",
        errorText: t("field:latitudeError", [_latitudeRange.min, _latitudeRange.max]),
        range: { ..._latitudeRange },
        ...latLongFieldBase.current
    });

    const longitudeField = React.useRef({
        label: t("field:longitude"),
        id: `${field.id}::longitude`,
        key: "longitude",
        errorText: t("field:longitudeError", [_longitudeRange.min, _longitudeRange.max]),
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
                handleChange={onInputChange}
                inputProps={{
                    min: latitudeField.current.range.min,
                    max: latitudeField.current.range.max
                }}
            />
            <GenericTextField
                field={longitudeField.current}
                value={location?.longitude}
                handleChange={onInputChange}
                inputProps={{
                    min: longitudeField.current.range.min,
                    max: longitudeField.current.range.max
                }}
            />
            <Box sx={{ height: "200px", width: "100%" }}>
                <LocationsMapNative locations={location} resetOnChange={false} onMapClick={onMapClick} />
            </Box>
        </React.Fragment>
    );
};

const LatLongField = [ LatLongFieldComp, validateLatLong];
export default LatLongField;
