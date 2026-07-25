import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Form, { FIELD_TYPE_TEXT } from 'components/form';
import { useFavorites } from 'providers';
import { useTranslation, useNamespaceAllLanguages } from 'utils';

const CollectionForm = ({ onCancel, collection, copyFrom }) => {
    // collection: null (create mode) | {id, name} (edit mode)
    // copyFrom: {id, name} of the source collection (copy mode) — ignored if collection is set
    const t = useTranslation("pages.favorites.collections");
    const { createCollection, renameCollection } = useFavorites();

    // "main"'s translated label in every supported language — a custom collection must never
    // collide with it in ANY language, not just the one currently active, otherwise switching
    // the app's language later could make two rows both display as e.g. "Main".
    const collectionsNamespaceByLanguage = useNamespaceAllLanguages("pages.favorites.collections");
    const isReservedName = useCallback((value) => {
        if (!value || !collectionsNamespaceByLanguage) return false;
        const normalized = value.trim().toLowerCase();
        return Object.values(collectionsNamespaceByLanguage)
            .some((namespace) => namespace.main.trim().toLowerCase() === normalized);
    }, [collectionsNamespaceByLanguage]);

    const fields = useMemo(() => [
        {
            id: "name",
            label: t("lbl:name"),
            type: FIELD_TYPE_TEXT,
            required: true,
            errorText: (value) => isReservedName(value) ? t("error:reservedName") : t("error:emptyName"),
            validator: (_field, value) => !!value && !isReservedName(value),
            default: "",
            focus: true,
        },
    ], [t, isReservedName]);

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
