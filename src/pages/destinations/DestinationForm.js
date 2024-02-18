import React, { useState, useEffect, useCallback } from 'react';
import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_SELECT,
    FIELD_TYPE_DATE,
    FIELD_TYPE_SWITCH
} from 'components/form';
import { useQueryContext } from '../../components/queryContext';
import { useTranslation } from 'utils';

const DestinationForm = ({destination, onCancel}) => {

    const t = useTranslation("pages.destinations");
    const queryContext = useQueryContext();

    const addDestinationMutation = queryContext.useAddDestination();
    const updateDestinationMutation = queryContext.useUpdateDestination();

    const [fields, setFields] = useState([]);

    const getImagesFromPath = useCallback(([path]) => {
        const { data, isError, error } = queryContext.useFetchDestinationImages(path);
        if (isError === true) {
            throw error;
        }
        return data;
    }, [queryContext]);

    const getLocations = useCallback(() => {
        const { data, isError, error } = queryContext.useFetchLocations();
        if (isError === true) {
            throw error;
        }
        return data;
    }, [queryContext]);

    const getImageFolders = useCallback(() => {
        const { data, isError, error } = queryContext.useFetchImageFolders();
        if (isError === true) {
            throw error;
        }
        return data;
    }, [queryContext])

    useEffect(() => {
        setFields([
            {
                id: "title",
                label: t("form:titleField_fr"),
                required: true,
                errorText: t("form:titleError_fr"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: ""
            },
            {
                id: "title_en",
                label: t("form:titleField_en"),
                required: true,
                errorText: t("form:titleError_en"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: ""
            },
            {
                id: "date",
                label: t("form:dateField"),
                required: true,
                errorText: t("form:dateError"),
                type: FIELD_TYPE_DATE,
                default: ""
            },
            {
                id: "location",
                label: t("form:locationField"),
                required: true,
                errorText: t("form:locationError"),
                type: FIELD_TYPE_SELECT,
                options: getLocations,
                default: ""
            },
            {
                id: "path",
                label: t("form:imagePathField"),
                required: true,
                errorText: t("form:imagePathError"),
                type: FIELD_TYPE_SELECT,
                options: getImageFolders,
                mapping: {
                    "value": "path",
                    "caption": "path",
                    "key": "path"
                },
                default: "",
                dependencies: [
                    'cover'
                ]
            },
            {
                id: "cover",
                label: t("form:coverField"),
                required: true,
                errorText: t("form:coverError"),
                type: FIELD_TYPE_SELECT,
                default: "",
                options: getImagesFromPath,
                mapping: {
                    "value": "name",
                    "caption": "name",
                    "key": "id"
                },
                dependsOn: [
                    "path"
                ]
            },
            {
                id: "macro",
                label: t("form:hasMacro"),
                type: FIELD_TYPE_SWITCH,
                default: false
            },
            {
                id: "wide",
                label: t("form:hasWideAngle"),
                type: FIELD_TYPE_SWITCH,
                default: false
            }
        ]);
    }, [getImagesFromPath, getImageFolders, getLocations, t]);

    const [values, setValues] = useState(null);

    useEffect(() => {
        if (destination === null) {
            setValues(null);
        } else {
            setValues({
                "title": destination.title,
                "title_en": destination.title_en,
                "date": destination.date.substring(0, 10), // 2020-03-10.....
                "location": destination.location,
                "path": destination.path,
                "cover": destination.cover.split('/').at(-1),
                "macro": destination.macro,
                "wide": destination.wide,
            })
        }

    }, [destination]);

    const onSubmitDestinationForm = React.useCallback((values) => {
        if (destination === null) {
            // New Destination
            return addDestinationMutation.mutateAsync(values);
        } else {
            // Update destination
            return updateDestinationMutation.mutateAsync({id: destination.id, ...values});
        }
    }, [destination, addDestinationMutation, updateDestinationMutation]);

    return (
        <Form
            fields={fields}
            initialValues={values}
            submitAction={onSubmitDestinationForm}
            submitCaption={t("validate")}
            onCancel={onCancel}
            validationMessage={t("validationMessage")}
        />
    )
}

export default DestinationForm;