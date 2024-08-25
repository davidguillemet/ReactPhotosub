import React from 'react';
import Form, { FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_SELECT } from "components/form";
import { useQueryContext } from 'components/queryContext';
import { useDestinationGalleryContext } from './DestinationGalleryContext';

const SubGalleryForm = ({destination, subGallery, onCancel}) => {

    const galleryContext = useDestinationGalleryContext();
    const queryContext = useQueryContext();
    const subGalleryAddMutation = queryContext.useAddSubGallery();
    const subGalleryUpdateMutation = queryContext.useUpdateSubGallery();
    const [ fields, setFields ] = React.useState([]);

    const [values, setValues] = React.useState(null);

    const onSubmitGalleryForm = React.useCallback((values) => {
        const finalValues = {
            ...subGallery, // Set initial values (including id)
            ...values,     // Override with form values
            destination_id: destination.id // And add the destination id if needed (new gallery)
        };
        if (subGallery === null)
            return subGalleryAddMutation.mutateAsync({ subGallery: finalValues, destination });
        else
            return subGalleryUpdateMutation.mutateAsync({ subGallery: finalValues, destination });
    }, [destination, subGalleryAddMutation, subGalleryUpdateMutation, subGallery]);

    const getLocations = React.useCallback(() => {
        const { data, isError, error } = queryContext.useFetchLocations();
        if (isError === true) {
            throw error;
        }
        return [ {title: "Pas de lieu", value: null, id: null}, ...data];
    }, [queryContext]);

    const getFirstAvailableIndex = React.useCallback(() => {
        let minAvailableIndex = 1;
        galleryContext.galleries.forEach(gallery => {
            if (gallery.index >= minAvailableIndex) {
                minAvailableIndex = gallery.index + 1;
            }
        })
        return minAvailableIndex;
    }, [galleryContext.galleries]);

    const getUsedIndices = React.useCallback(() => {
        const usedIndices = galleryContext.galleries.reduce((indices, gallery) => {
            if (subGallery === null || gallery.id !== subGallery.id) {
                indices.push(gallery.index);
            }
            return indices;
        }, []);
        return usedIndices;
    }, [galleryContext.galleries, subGallery]);

    React.useEffect(() => {
        setFields([
            {
                id: "title",
                label: "Titre en français",
                required: true,
                errorText: "Merci d'indiquer un titre en français.",
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: ""
            },
            {
                id: "title_en",
                label: "Titre en anglais",
                required: true,
                errorText: "Merci d'indiquer un titre en anglais.",
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: ""
            },
            {
                id: "desc",
                label: "Description",
                required: false,
                type: FIELD_TYPE_TEXT,
                multiline: true,
                minRows: 2,
                default: ""
            },
            {
                id: "desc_en",
                label: "Description en anglais",
                required: false,
                type: FIELD_TYPE_TEXT,
                multiline: true,
                minRows: 2,
                default: ""
            },
            {
                id: "location",
                label: "Lieu",
                required: false,
                errorText: "Merci de renseigner un lieu",
                type: FIELD_TYPE_SELECT,
                options: getLocations,
                default: null
            },
            {
                id: "index",
                label: "Position",
                required: true,
                errorText: "Merci d'indiquer une position non utilisée.",
                type: FIELD_TYPE_NUMBER,
                step: 1,
                min: 1,
                multiline: false,
                default: getFirstAvailableIndex(),
                invalidValues: getUsedIndices()
            },
        ]);
    }, [getFirstAvailableIndex, getUsedIndices, getLocations]);

    React.useEffect(() => {
        if (subGallery === null) {
            setValues(null);
        } else {
            setValues({ ...subGallery });
        }
    }, [subGallery]);

    return (
        <Form
            fields={fields}
            initialValues={values}
            submitAction={onSubmitGalleryForm}
            submitCaption="Valider"
            onCancel={onCancel}
            validationMessage="La sous-galerie a été sauvegardée."
        />
    );
}

export default SubGalleryForm;