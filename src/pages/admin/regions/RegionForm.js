import React from 'react';
import { Box } from '@mui/system';
import { ListItemText } from '@mui/material';
import { useQueryContext } from 'components/queryContext';
import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_SELECT
} from 'components/form/Form';
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

const RegionForm = ({region, regions, onChange, onCancel, onNewRegion}) => {

    const queryContext = useQueryContext();
    const [regionFields, setRegionFields] = React.useState([]);

    const addRegionMutation = queryContext.useAddRegion();
    const updateRegionMutation = queryContext.useUpdateRegion();

    const onSubmitRegionForm = React.useCallback((values) => {
        const regionToSave = {
            ...values
        }

        if (region === null || region.id === undefined) {
            // New Region
            return addRegionMutation.mutateAsync(regionToSave)
                .then((data) => {
                    const newRegion = data.find(loc => regions.findIndex(l => l.id === loc.id) === -1);
                    onNewRegion(newRegion);
                })
        } else {
            // Update Location
            return updateRegionMutation.mutateAsync({id: region.id, ...regionToSave});
        }
    }, [region, regions, addRegionMutation, updateRegionMutation, onNewRegion]);

    const initialValues = React.useRef({
        ...region,
    });

    React.useEffect(() => {
        setRegionFields([
            {
                id: "title",
                label: "Titre",
                required: true,
                errorText: "Merci d'indiquer le titre de la région.",
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                multiLingual: true
            },
            {
                id: "parent",
                label: "Region parent",
                required: false,
                type: FIELD_TYPE_SELECT,
                options: () => regions,
                optionComponent: RegionItem,
                default: null
            }
        ]);
    }, [regions]);

    return (
        <Form
            fields={regionFields}
            initialValues={initialValues.current}
            submitAction={onSubmitRegionForm}
            submitCaption="Valider"
            validationMessage="La région a bien été enregistrée."
            onChange={onChange}
            onCancel={onCancel}
        />
    );
}

export default RegionForm;
