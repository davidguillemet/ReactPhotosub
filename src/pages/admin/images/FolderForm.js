import React from 'react';
import Form, {
    FIELD_TYPE_TEXT
} from 'components/form';
import { useImageContext } from './ImageContext';

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
        const createFolder = imageContext.createFolder;
        return createFolder(values.name);
    }, [imageContext.createFolder]);

    return (
        <Form
            fields={formFields}
            submitAction={onSubmitFolderForm}
            submitCaption="Valider"
            validationMessage="Le répertoire a été créé avec succès."
            onChange={onChange}
            onCancel={onCancel}
        />
    );
}

export default FolderForm;
