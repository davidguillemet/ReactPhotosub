import React, { useState, useEffect, useCallback } from 'react';
import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_SELECT,
    FIELD_TYPE_DATE,
    FIELD_TYPE_SWITCH,
    FIELD_TYPE_TAGS_FIELD,
    FIELD_TYPE_HIDDEN
} from 'components/form';
import { useQueryContext } from 'components/queryContext';
import { useTranslation } from 'utils';

import {
    DESTINATION_INTENT_CREATE,
    DESTINATION_INTENT_UPDATE
} from 'utils/destinations';

const DestinationForm = ({destination, onCancel}) => {

    const t = useTranslation("pages.destinations");
    const queryContext = useQueryContext();

    const [fields, setFields] = useState([]);

    const getImagesFromPath = useCallback(([path]) => {
        const { data, isError, error } = queryContext.useFetchDestinationImages(path);
        if (isError === true) {
            throw error;
        }
        return data ? data.images : null;
    }, [queryContext]);

    const getLocations = useCallback(() => {
        const { data, isError, error } = queryContext.useFetchLocations();
        if (isError === true) {
            throw error;
        }
        return data;
    }, [queryContext]);

    const getImageFolders = useCallback(([date]) => {
        const { data, isError, error } = queryContext.useFetchImageFolders();
        if (isError === true) {
            throw error;
        }
        if (data && date) {
            const datePrefix = date.substring(0, 4); // Get the year from the date
            return data.filter(folder => folder.path.startsWith(datePrefix));
        }
        return data;
    }, [queryContext])

    useEffect(() => {
        setFields([
            {
                id: "title",
                label: t("form:titleField"),
                required: true,
                errorText: t("form:titleError"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                multiLingual: true,
                focus: true
            },
            {
                id: "date",
                label: t("form:dateField"),
                required: true,
                errorText: t("form:dateError"),
                type: FIELD_TYPE_DATE,
                default: "",
                dependencies: [
                    "path"
                ]
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
                ],
                dependsOn: [
                    "date"
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
                id: "tags",
                label: t("form:tags"),
                required: false,
                type: FIELD_TYPE_TAGS_FIELD,
                multiline: true,
                default: []
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
            },
            {
                id: "published",
                label: t("form:published"),
                type: FIELD_TYPE_SWITCH,
                default: true
            },
            {
                id: "id",
                type: FIELD_TYPE_HIDDEN,
                default: destination === null ? null : destination.id // Set the destination id if needed (update form)
            },
            {
                id: "intent",
                type: FIELD_TYPE_HIDDEN,
                default: destination === null ? DESTINATION_INTENT_CREATE : DESTINATION_INTENT_UPDATE
            }
        ]);
    }, [getImagesFromPath, getImageFolders, getLocations, destination, t]);

    const [values, setValues] = useState(null);

    useEffect(() => {
        if (destination === null) {
            setValues(null);
        } else {
            setValues({
                ...destination,
                "date": destination.date.substring(0, 10), // 2020-03-10.....
                "cover": destination.cover.split('/').at(-1)
            });
        }

    }, [destination]);

    return (
        <Form
            fields={fields}
            initialValues={values}
            submitCaption={t("validate")}
            onCancel={onCancel}
            validationMessage={t("validationMessage")}
            fetcherName={`destinationForm-${destination ? destination.id : "new"}`}
        />
    )
}

export default DestinationForm;