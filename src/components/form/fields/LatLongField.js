import React from 'react';
import { Box } from '@mui/system';
import { LocationsMapNative } from '../../map';
import { FIELD_TYPE_NUMBER } from '../FormContext';
import { useTranslation } from 'utils';
import { validateValueRange } from './common';
import { getFieldSpecFromField } from '../FormContext';

const getLatLongFieldSpecTemplate = () => {
    const fieldTemplate = {
        type: FIELD_TYPE_NUMBER,
        step: 0.0001,
        multiline: false,
        default: 0
    };
    return getFieldSpecFromField(fieldTemplate);
};

const getLatLongFieldSpecBase = (fieldSpec) => {
    const fieldSpecTemplate = getLatLongFieldSpecTemplate();
    return {
        ...fieldSpecTemplate,
        field: {
            ...fieldSpecTemplate.field,
            required: fieldSpec.field.required,
            readOnly: fieldSpec.field.readOnly,
        }
    }
}

const _latitudeRange = { min: -90, max: 90 };
const _longitudeRange = { min: -180, max: 180 };
const initializeLocation = (value) => {
    if (value === null || value === undefined) {
        return null;
    } else {
        return { ...value };
    }
};

const validateLatLong = (_fieldSpec, latLongValue) => {
    return latLongValue !== null && latLongValue !== undefined &&
           validateLatitude(latLongValue.latitude) && validateLongitude(latLongValue.longitude);
};

const validateLatitude = (latitude) => {
    return latitude !== null && latitude !== undefined && validateValueRange(latitude, _latitudeRange);
};

const validateLongitude = (longitude) => {
    return longitude !== null && longitude !== undefined && validateValueRange(longitude, _longitudeRange);
};

const LATITUDE_KEY = "latitude";
const LONGITUDE_KEY = 'longitude';

const LAT_LONG_VALIDATOR = {
    [LATITUDE_KEY]: validateLatitude,
    [LONGITUDE_KEY]: validateLongitude
};


const LatLongFieldComp = ({ fieldSpec, value, handleChange }) => {

    const t = useTranslation("components.form");
    const [location, setLocation] = React.useState(null);
    const [error, setError] = React.useState({});
    const locationSource = React.useRef(null);

    const latLongFieldSpecBase = React.useRef(getLatLongFieldSpecBase(fieldSpec));

    const latitudeFieldSpec = React.useRef({
        ...latLongFieldSpecBase.current,
        field: {
            label: t("field:latitude"),
            id: `${fieldSpec.field.id}::${LATITUDE_KEY}`,
            key: LATITUDE_KEY,
            errorText: t("field:latitudeError", [_latitudeRange.min, _latitudeRange.max]),
            range: { ..._latitudeRange },
            ...latLongFieldSpecBase.current.field
        }
    });

    const longitudeFieldSpec = React.useRef({
        ...latLongFieldSpecBase.current,
        field: {
            label: t("field:longitude"),
            id: `${fieldSpec.field.id}::${LONGITUDE_KEY}`,
            key: LONGITUDE_KEY,
            errorText: t("field:longitudeError", [_longitudeRange.min, _longitudeRange.max]),
            range: { ..._longitudeRange },
            ...latLongFieldSpecBase.current.field
        }
    });

    React.useEffect(() => {
        setLocation(initializeLocation(value));
    }, [value]);

    React.useEffect(() => {
        if (locationSource.current === "input") {
            handleChange(fieldSpec, location);
        }
        locationSource.current = null;
    }, [location, fieldSpec, handleChange]);

    const onInputChange = React.useCallback((singleFieldSpec, newValue) => {
        locationSource.current = "input";
        const componentKey = singleFieldSpec.field.key; // "latitude" or "longitude"
        setError(prev => ({
            ...prev,
            [componentKey]: !LAT_LONG_VALIDATOR[componentKey](newValue)
        }));
        setLocation(prevValue => {
            return {
                ...(prevValue && prevValue),
                [componentKey]: newValue
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

    const LatLongSubComponent = latLongFieldSpecBase.current.component;

    return (
        <React.Fragment>
            <LatLongSubComponent
                fieldSpec={latitudeFieldSpec.current}
                value={location?.latitude}
                handleChange={onInputChange}
                inputProps={{
                    min: latitudeFieldSpec.current.field.range.min,
                    max: latitudeFieldSpec.current.field.range.max
                }}
                hasError={error[LATITUDE_KEY] !== undefined && error[LATITUDE_KEY] === true}
            />
            <LatLongSubComponent
                fieldSpec={longitudeFieldSpec.current}
                value={location?.longitude}
                handleChange={onInputChange}
                inputProps={{
                    min: longitudeFieldSpec.current.field.range.min,
                    max: longitudeFieldSpec.current.field.range.max
                }}
                hasError={error[LONGITUDE_KEY] !== undefined && error[LONGITUDE_KEY] === true}
            />
            <Box sx={{ height: "200px", width: "100%" }}>
                <LocationsMapNative locations={location} resetOnChange={false} onMapClick={onMapClick} />
            </Box>
        </React.Fragment>
    );
};

const LatLongField = [ LatLongFieldComp, validateLatLong];
export default LatLongField;
