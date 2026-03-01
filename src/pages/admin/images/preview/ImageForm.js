import React from 'react';
import { useTranslation } from 'utils';
import { useQueryContext } from 'components/queryContext';
import Form, {
    FIELD_TYPE_TAGS_FIELD,
    FIELD_TYPE_TEXT,
} from 'components/form';


function getFields(t) {
    return [
        {
            id: "title",
            label: t("field:titleFr"),
            required: false,
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: ""
        },
        {
            id: "description",
            label: t("field:titleEn"),
            required: false,
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: ""
        },
        {
            id: "tags",
            label: t("field:tags"),
            required: true,
            errorText: t("error:tags"),
            type: FIELD_TYPE_TAGS_FIELD,
            multiline: true,
            default: []
        },
    ];
}

const ImageForm = ({image, onChange, onCancel}) => {
    const t = useTranslation("pages.admin.images.form");
    const queryContext = useQueryContext();

    const [ fields, setFields ] = React.useState(null);

    React.useEffect(() => {
        setFields(getFields(t));
    }, [t]);

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
            fields={fields}
            initialValues={initialValues.current}
            submitAction={onSubmitImageForm}
            submitCaption={t("btn:validate")}
            validationMessage={t("success:saved")}
            onChange={onChange}
            onCancel={onCancel}
            readOnly={false}
        />
    );
}

export default ImageForm;
