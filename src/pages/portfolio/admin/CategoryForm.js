import React from 'react';
import { useTranslation } from 'utils';
import Form, { FIELD_TYPE_TEXT, FIELD_TYPE_HIDDEN } from "components/form";
import { PORTFOLIO_CATEGORY_INTENT_CREATE, PORTFOLIO_CATEGORY_INTENT_UPDATE } from 'utils/portfolio';

const CategoryForm = ({category, categories, onCancel}) => {
    const t = useTranslation("pages.portfolio.admin");
    const [ fields, setFields ] = React.useState(null);

    const [values, setValues] = React.useState(null);

    const validateKey = React.useCallback((newKey) => {
        // Make sure the new key is not a duplicate
        return !!newKey && categories.findIndex(c => c.key === newKey) === -1;
    }, [categories]);

    React.useEffect(() => {
        setFields([
            {
                id: "key",
                label: t("field:key"),
                required: true,
                errorText: (value) => !!value ? t("error:duplicateKey", value): t("error:title"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                focus: true,
                validator: (_field, value) => validateKey(value)
            },
            {
                id: "caption",
                label: t("field:caption"),
                required: true,
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                multiLingual: true,
                languageSuffix: true
            },
            {
                id: "id",
                type: FIELD_TYPE_HIDDEN,
                default: category === null ? null : category.id // Set the category id if needed (update form)
            },
            {
                id: "intent",
                type: FIELD_TYPE_HIDDEN,
                default: category === null ? PORTFOLIO_CATEGORY_INTENT_CREATE : PORTFOLIO_CATEGORY_INTENT_UPDATE
            }
        ]);
    }, [category, validateKey, t]);

    React.useEffect(() => {
        if (category === null) {
            setValues(null);
        } else {
            setValues({ ...category });
        }
    }, [category]);

    return (
        <Form
            fields={fields}
            initialValues={values}
            submitCaption={t("btn:validate")}
            onCancel={onCancel}
            validationMessage={t("success:saved")}
            fetcherName={`categoryForm-${category ? category.id : "new"}`} // Unique fetcher name to avoid conflicts with other forms
        />
    );
}

export default CategoryForm;