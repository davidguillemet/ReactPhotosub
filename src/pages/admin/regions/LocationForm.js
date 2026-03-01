import React from 'react';
import { useTranslation } from 'utils';
import { Box } from '@mui/system';
import { ListItemText } from '@mui/material';
import { useQueryContext } from 'components/queryContext';
import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_URL,
    FIELD_TYPE_LATLONG,
    FIELD_TYPE_SELECT
} from 'components/form';
import { alpha } from '@mui/material/styles';

const RegionItem = ({option}) => {
    return (
        <Box sx={{display: "flex", flexDirection: "row"}}>
            {
                [...Array(option.level)].map((x, i) => {
                    return (
                        <Box
                            key={i}
                            sx={{
                                width: "15px",
                                marginLeft: "15px",
                                paddingLeft: "18px",
                                borderLeft: theme => `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
                            }}
                        />
                    )
                })
            }
            <Box sx={{display: "flex", flexGrow: 1, py: 0.5}}>
                <ListItemText primary={option.title} />
            </Box>
        </Box>
    );
}

const LocationForm = ({location, locations, regions, onChange, onCancel, onNewLocation}) => {
    const t = useTranslation("pages.admin.regions.locationForm");
    const queryContext = useQueryContext();
    const [locationFields, setLocationFields] = React.useState(null);

    const addLocationMutation = queryContext.useAddLocation();
    const updateLocationMutation = queryContext.useUpdateLocation();

    const onSubmitLocationForm = React.useCallback((values) => {
        const locationToSave = {
            ...values,
            ...values.latlong,
        }
        delete locationToSave.latlong;

        if (location === null || location.id === undefined) {
            // New Location
            return addLocationMutation.mutateAsync(locationToSave)
                .then((data) => {
                    const newRegion = data.find(loc => locations.findIndex(l => l.id === loc.id) === -1);
                    onNewLocation(newRegion);
                })
        } else {
            // Update Location
            return updateLocationMutation.mutateAsync({id: location.id, ...locationToSave});
        }
    }, [location, locations, addLocationMutation, updateLocationMutation, onNewLocation]);

    const initialValues = React.useRef({
        ...location,
        ...(location && {
                latlong: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            })
    });

    React.useEffect(() => {
        setLocationFields([
            {
                id: "title",
                label: t("field:title"),
                required: true,
                errorText: t("error:title"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                focus: true,
            },
            {
                id: "region",
                label: t("field:region"),
                required: true,
                errorText: t("error:region"),
                type: FIELD_TYPE_SELECT,
                options: () => regions,
                optionComponent: RegionItem,
                default: ""
            },
            {
                id: "latlong",
                required: true,
                type: FIELD_TYPE_LATLONG
            },
            {
                id: "link",
                label: t("field:website"),
                required: false,
                errorText: t("field:website"),
                type: FIELD_TYPE_URL,
                multiline: false,
                default: ""
            },
        ]);
    }, [regions, t]);

    return (
        <Form
            fields={locationFields}
            initialValues={initialValues.current}
            submitAction={onSubmitLocationForm}
            submitCaption={t("btn:validate")}
            validationMessage={t("success:saved")}
            onChange={onChange}
            onCancel={onCancel}
        />
    );
}

export default LocationForm;
