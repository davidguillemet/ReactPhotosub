import React from 'react';
import { useTranslation } from 'utils';
import Form, { FIELD_TYPE_TEXT, FIELD_TYPE_HIDDEN } from "components/form";
import { PORTFOLIO_CATEGORY_INTENT_CREATE, PORTFOLIO_CATEGORY_INTENT_UPDATE } from 'utils/portfolio';

const CategoryForm = ({category, onCancel}) => {
    const t = useTranslation("pages.portfolio.admin");
    const [ fields, setFields ] = React.useState(null);

    const [values, setValues] = React.useState(null);

    React.useEffect(() => {
        setFields([
            {
                id: "key",
                label: t("field:key"),
                required: true,
                errorText: t("error:title"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: "",
                focus: true
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
    }, [category, t]);

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