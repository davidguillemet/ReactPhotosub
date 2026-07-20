import React, { useState, useEffect, useCallback } from 'react';
import Form, { FIELD_TYPE_TEXT } from 'components/form';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';

const CollectionForm = ({ onCancel, collection }) => {
    // collection: null (create mode) | {id, name_fr, name_en} (edit mode)
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
            multiLingual: true,
            languageSuffix: true,
        },
    ], [t]);

    const [values, setValues] = useState(null);

    useEffect(() => {
        if (!collection) {
            setValues(null);
        } else {
            setValues({ name_fr: collection.name_fr, name_en: collection.name_en });
        }
    }, [collection]);

    const handleSubmit = useCallback((values) => {
        // languageSuffix: true generates: { name_fr: <fr value>, name_en: <en value> }
        const action = collection
            ? renameCollection(collection.id, values.name_fr, values.name_en) // eslint-disable-line camelcase
            : createCollection(values.name_fr, values.name_en); // eslint-disable-line camelcase
        return action.then(() => { if (onCancel) onCancel(); });
    }, [collection, createCollection, renameCollection, onCancel]);

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
