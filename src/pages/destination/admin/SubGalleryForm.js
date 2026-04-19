import React from 'react';
import { useTranslation } from 'utils';
import Form, { FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_SELECT, FIELD_TYPE_HIDDEN } from "components/form";
import { useQueryContext } from 'components/queryContext';
import { useDestinationGalleryContext } from './DestinationGalleryContext';
import { SUB_GALLERY_INTENT_CREATE, SUB_GALLERY_INTENT_UPDATE } from 'utils/destinations';

const SubGalleryForm = ({destination, subGallery, onCancel}) => {
    const t = useTranslation("pages.destinationAdmin.subGalleryForm");
    const galleryContext = useDestinationGalleryContext();
    const queryContext = useQueryContext();
    const [ fields, setFields ] = React.useState(null);

    const [values, setValues] = React.useState(null);

    const getLocations = React.useCallback(() => {
        const { data, isError, error } = queryContext.useFetchLocations();
        if (isError === true) {
            throw error;
        }
        return [ {title: t("field:noLocation"), value: null, id: null}, ...data];
    }, [queryContext, t]);

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
                label: t("field:title"),
                required: true,
                errorText: t("error:title"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                multiLingual: true,
                focus: true
            },
            {
                id: "desc",
                label: t("field:description"),
                required: false,
                type: FIELD_TYPE_TEXT,
                multiline: true,
                minRows: 2,
                default: "",
                multiLingual: true
            },
            {
                id: "location",
                label: t("field:location"),
                required: false,
                errorText: t("error:location"),
                type: FIELD_TYPE_SELECT,
                options: getLocations,
                default: null
            },
            {
                id: "index",
                label: t("field:position"),
                required: true,
                errorText: t("error:position"),
                type: FIELD_TYPE_NUMBER,
                step: 1,
                min: 1,
                multiline: false,
                default: getFirstAvailableIndex(),
                invalidValues: getUsedIndices()
            },
            {
                id: "id",
                type: FIELD_TYPE_HIDDEN,
                default: subGallery === null ? null : subGallery.id // Set the sub gallery id if needed (update form)
            },
            {
                id: "destination_id",
                type: FIELD_TYPE_HIDDEN,
                default: destination.id // Add the destination id if needed (new gallery)
            },
            {
                id: "destinationPath",
                type: FIELD_TYPE_HIDDEN,
                default: destination.path // Used to update the query cache after mutation (query key)
            },
            {
                id: "intent",
                type: FIELD_TYPE_HIDDEN,
                default: subGallery === null ? SUB_GALLERY_INTENT_CREATE : SUB_GALLERY_INTENT_UPDATE
            }
        ]);
    }, [getFirstAvailableIndex, getUsedIndices, getLocations, subGallery, destination, t]);

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
            submitCaption={t("btn:validate")}
            onCancel={onCancel}
            validationMessage={t("success:saved")}
            fetcherName={`subGalleryForm-${destination.id}-${subGallery ? subGallery.id : "new"}`} // Unique fetcher name to avoid conflicts with other forms
        />
    );
}

export default SubGalleryForm;