import React, { useState, useEffect, useCallback } from 'react';
import Form, { FIELD_TYPE_TEXT } from 'components/form';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';

const CollectionForm = ({ onCancel, collection, copyFrom }) => {
    // collection: null (create mode) | {id, name} (edit mode)
    // copyFrom: {id, name} of the source collection (copy mode) — ignored if collection is set
    const t = useTranslation("pages.favorites.collections");
    const { createCollection, renameCollection } = useFavorites();

    const fields = React.useMemo(() => [
        {
            id: "name",
            label: t("lbl:name"),
            type: FIELD_TYPE_TEXT,
            required: true,
            errorText: t("error:emptyName"),
            default: "",
            focus: true,
        },
    ], [t]);

    const [values, setValues] = useState(null);

    useEffect(() => {
        if (collection) {
            setValues({ name: collection.name });
        } else if (copyFrom) {
            setValues({ name: t("lbl:copyName", copyFrom.name) });
        } else {
            setValues(null);
        }
    }, [collection, copyFrom, t]);

    const handleSubmit = useCallback((values) => {
        const action = collection
            ? renameCollection(collection.id, values.name)
            : createCollection(values.name, copyFrom?.id);
        return action.then(() => { if (onCancel) onCancel(); });
    }, [collection, copyFrom, createCollection, renameCollection, onCancel]);

    return (
        <Form
            fields={fields}
            initialValues={values}
            submitCaption={collection ? t("btn:save") : t("btn:create")}
            submitAction={handleSubmit}
            onCancel={onCancel}
        />
    );
};

export default CollectionForm;
