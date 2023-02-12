import React, { useState, useCallback, useEffect } from 'react';
import { Prompt } from "react-router-dom";
import { PageTitle } from '../../template/pageTypography';
import { useGlobalContext } from '../../components/globalContext';
import { useAuthContext } from '../../components/authentication';

import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_SWITCH,
    FIELD_TYPE_CAPTCHA
} from '../../components/form';

const Contact = () => {

    const context = useGlobalContext();
    const authContext = useAuthContext();
    const [initialValues, setInitialValues] = useState(null);

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

    const fields = React.useRef([
        {
            id: "name",
            label: "Votre nom",
            required: true,
            errorText: "Merci d'indiquer votre nom.",
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: null
        },
        {
            id: "email",
            label: "Votre adresse de messagerie",
            required: true,
            errorText: "Merci d'indiquer une adresse de messagerie valide.",
            type: FIELD_TYPE_EMAIL,
            multiline: false,
            default: null
        },
        {
            id: "subject",
            label: "Le titre de votre message",
            required: true,
            errorText: "Merci d'indiquer l'objet de votre message.",
            type: FIELD_TYPE_TEXT,
            multiline: false,
            default: null
        },
        {
            id: "message",
            label: "Votre message",
            required: true,
            errorText: "Merci de saisir un message.",
            type: FIELD_TYPE_TEXT,
            multiline: true,
            default: null
        },
        {
            id: "sendcopy",
            label: "Recevoir une copie de votre message",
            type: FIELD_TYPE_SWITCH,
            default: false
        },
        {
            id: "token",
            required: true,
            type: FIELD_TYPE_CAPTCHA,
            default: null
        }
    ]);

    const [isDirty, setIsDirty] = React.useState(false);

    const onSubmitMessageForm = useCallback((values) => {
        setIsDirty(false);
        return context.dataProvider.sendMessage(values);
    }, [context]);

    const onChange = useCallback(() => {
        setIsDirty(true);
    }, []);

    return (
        <React.Fragment>
            <PageTitle>Pour me contacter</PageTitle>

            <Form
                fields={fields.current}
                initialValues={initialValues}
                submitAction={onSubmitMessageForm}
                onChange={onChange}
                validationMessage="Votre message a bien été envoyé. Merci!"
            />

            <Prompt when={isDirty} message={"Votre message n'a pas été envoyé après les dernières modifications.\nContinuer la navigation?"} />

        </React.Fragment>
    );
}

export default Contact