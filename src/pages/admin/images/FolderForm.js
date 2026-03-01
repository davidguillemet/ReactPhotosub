import React from 'react';
import { useTranslation } from 'utils';
import Form, {
    FIELD_TYPE_TEXT
} from 'components/form';
import { useImageContext } from './ImageContext';

function getFields(t) {
    return [
        {
            id: "name",
            label: t("field:name"),
            required: true,
            errorText: t("error:name"),
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: "",
            focus: true
        }
    ];
}

const FolderForm = ({onChange, onCancel}) => {
    const t = useTranslation("pages.admin.images.folderForm");
    const imageContext = useImageContext();
    const [ fields, setFields ] = React.useState(null);

    React.useEffect(() => {
        setFields(getFields(t));
    }, [t]);

    const onSubmitFolderForm = React.useCallback((values) => {
        const createFolder = imageContext.createFolder;
        return createFolder(values.name);
    }, [imageContext.createFolder]);

    return (
        <Form
            fields={fields}
            submitAction={onSubmitFolderForm}
            submitCaption={t("btn:validate")}
            validationMessage={t("success:created")}
            onChange={onChange}
            onCancel={onCancel}
        />
    );
}

export default FolderForm;
