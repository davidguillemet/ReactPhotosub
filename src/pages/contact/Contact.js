import React, { useState, useCallback, useEffect } from 'react';
import { Prompt } from "react-router-dom";
import { PageTitle } from '../../template/pageTypography';
import { useAuthContext } from '../../components/authentication';

import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_SWITCH,
    FIELD_TYPE_CAPTCHA
} from '../../components/form';
import { useDataProvider } from '../../components/dataProvider';
import { useTranslation } from 'utils';

const getFields = (t) => {
    const fields = [
        {
            id: "name",
            label: t("field:name"),
            required: true,
            errorText: t("error:name"),
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: null
        },
        {
            id: "email",
            label: t("field:email"),
            required: true,
            errorText: t("error:email"),
            type: FIELD_TYPE_EMAIL,
            multiline: false,
            default: null
        },
        {
            id: "subject",
            label: t("field:object"),
            required: true,
            errorText: t("error:object"),
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: null
        },
        {
            id: "message",
            label: t("field:message"),
            required: true,
            errorText: t("error:message"),
            type: FIELD_TYPE_TEXT,
            multiline: true,
            default: null
        },
        {
            id: "sendcopy",
            label: t("switch:sendCopy"),
            type: FIELD_TYPE_SWITCH,
            default: false
        },
        {
            id: "token",
            required: true,
            type: FIELD_TYPE_CAPTCHA,
            default: null
        }
    ]
    fields.language = t.language;
    return fields;
}

const Contact = () => {

    const t = useTranslation("pages.contact");
    const dataProvider = useDataProvider();
    const authContext = useAuthContext();
    const [initialValues, setInitialValues] = useState(null);
    const [ fields, setFields ] = useState(() => getFields(t));

    useEffect(() => {
        setFields(prevFields => {
            if (prevFields.language !== t.language) {
                return getFields(t);
            }
            return prevFields;
        });
    }, [t]);

    useEffect(() => {
        const user = authContext.user;
        const initialValues =
            user === null || user === undefined ?
            null :
            {
                name: user.displayName,
                email: user.email
            };
        setInitialValues(initialValues);
    }, [authContext.user])


    const [isDirty, setIsDirty] = React.useState(false);

    const onSubmitMessageForm = useCallback((values) => {
        setIsDirty(false);
        return dataProvider.sendMessage(values);
    }, [dataProvider]);

    const onChange = useCallback(() => {
        setIsDirty(true);
    }, []);

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>

            <Form
                fields={fields}
                initialValues={initialValues}
                submitAction={onSubmitMessageForm}
                onChange={onChange}
                validationMessage={t("info:success")}
            />

            <Prompt when={isDirty} message={t("warning:leave")} />

        </React.Fragment>
    );
}

export default Contact