import React from 'react';
import { useQueryContext } from 'components/queryContext';
import Form, {
    FIELD_TYPE_TAGS_FIELD,
    FIELD_TYPE_TEXT,
} from 'components/form';

const imageFields = [
    {
        id: "title",
        label: "Titre en français",
        required: false,
        type: FIELD_TYPE_TEXT,
        multiline: false,
        default: ""
    },
    {
        id: "description",
        label: "Titre en anglais",
        required: false,
        type: FIELD_TYPE_TEXT,
        multiline: false,
        default: ""
    },
    {
        id: "tags",
        label: "Tags",
        required: true,
        errorText: "Merci d'ajouter des tags qui caractérisent l'image (lieu, espèce, couleur, etc).",
        type: FIELD_TYPE_TAGS_FIELD,
        multiline: true,
        default: []
    },
];

const ImageForm = ({image, onChange, onCancel}) => {

    const queryContext = useQueryContext();

    const updateImageMutation = queryContext.useUpdateImageProperties();

    const onSubmitImageForm = React.useCallback((values) => {
        // Update image
        return updateImageMutation.mutateAsync({
            ...image,
            ...values
        });
    }, [updateImageMutation, image]);

    const initialValues = React.useRef({
        ...image
    });

    return (
        <Form
            fields={imageFields}
            initialValues={initialValues.current}
            submitAction={onSubmitImageForm}
            submitCaption="Valider"
            validationMessage="Les nouvelles propriétés de l'image ont été sauvegardées."
            onChange={onChange}
            onCancel={onCancel}
            readOnly={false}
        />
    );
}

export default ImageForm;
