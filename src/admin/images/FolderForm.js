import React from 'react';
import Form, {
    FIELD_TYPE_TEXT
} from '../../components/form/Form';
import useImageContext from './ImageContextHook';

const formFields = [
    {
        id: "name",
        label: "Nom du Répertoire",
        required: true,
        errorText: "Merci d'indiquer le nom du répertoire.",
        type: FIELD_TYPE_TEXT,
        multiline: false,
        default: "",
        focus: true
    }
];

const FolderForm = ({onChange, onCancel}) => {
    const imageContext = useImageContext();

    const onSubmitFolderForm = React.useCallback((values) => {
        return imageContext.createFolder(values.name);
    }, [imageContext]);

    return (
        <Form
            fields={formFields}
            submitAction={onSubmitFolderForm}
            submitCaption="Valider"
            onChange={onChange}
            onCancel={onCancel}
        />
    );
}

export default FolderForm;
