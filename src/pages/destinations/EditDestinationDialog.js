import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {unstable_batchedUpdates} from 'react-dom';
import {isMobile} from 'react-device-detect';
import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_SELECT,
    FIELD_TYPE_DATE,
    FIELD_TYPE_SWITCH
} from '../../components/form';
import { useQueryContext } from '../../components/queryContext';
import { useTranslation } from 'utils';

const EditDestinationDialog = ({open, destination, onClose}) => {

    const t = useTranslation("pages.destinations");
    const queryContext = useQueryContext();

    const addDestinationMutation = queryContext.useAddDestination();
    const updateDestinationMutation = queryContext.useUpdateDestination();

    const [fields, setFields] = useState(null);

    const getImagesFromPath = useCallback(([path]) => {
        const [ year, title ] = (path !== null && path !== undefined) ? path.split('/') : [ null, null ];
        const { data, isError, error } = queryContext.useFetchDestinationImages(year, title);
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
                label: t("form:titleField"),
                required: true,
                errorText: t("form:titleError"),
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

    const [isOpen, setIsOpen] = useState(open);
    const [values, setValues] = useState(null);

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    useEffect(() => {
        if (destination === null) {
            setValues(null);
        } else {
            setValues({
                "title": destination.title,
                "date": destination.date.substring(0, 10), // 2020-03-10.....
                "location": destination.location,
                "path": destination.path,
                "cover": destination.cover.split('/').at(-1),
                "macro": destination.macro,
                "wide": destination.wide,
            })
        }

    }, [destination]);

    const handleClose = React.useCallback(() => {
        unstable_batchedUpdates(() => {
            // reinit all properties...
            setIsOpen(false);
            onClose();
            fields.forEach(field => delete field.error);
        });
    }, [onClose, fields]);

    const onSubmitDestinationForm = React.useCallback((values) => {
        if (destination === null) {
            // New Destination
            return addDestinationMutation.mutateAsync(values);
        } else {
            // Update destination
            return updateDestinationMutation.mutateAsync({id: destination.id, ...values});
        }
    }, [destination, addDestinationMutation, updateDestinationMutation]);

    const getDialogTitle = React.useCallback(() => {
        if (destination === null) {
            return t("title:newDestination")
        } else {
            return t("title:editDestination")
        }
    }, [destination, t]);

    return (
        <div>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                open={isOpen}
                onClose={handleClose}
            >
                <DialogTitle id="form-dialog-title">{getDialogTitle()}</DialogTitle>

                <DialogContent>
                    <Form
                        fields={fields}
                        initialValues={values}
                        submitAction={onSubmitDestinationForm}
                        submitCaption={t("validate")}
                        onCancel={handleClose}
                    />
                </DialogContent>

            </Dialog>
        </div>
    )
}

export default EditDestinationDialog;