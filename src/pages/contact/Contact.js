import React, { useEffect, useCallback } from 'react';
import { Prompt } from "react-router-dom";
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import { PageTitle } from '../../template/pageTypography';
import FeedbackMessage from '../../components/feedback/Feedback';
import { uniqueID } from '../../utils';
import ReCAPTCHA from "react-google-recaptcha";
import { useGlobalContext } from '../../components/globalContext';

const FIELD_TYPE_TEXT = 'text';
const FIELD_TYPE_EMAIL = 'email';
const FIELD_TYPE_SWITCH = 'switch';

const FormField = ({ field, handleChange, sending }) => {
    if (field.type === "switch") {
        return (
            <FormControlLabel
                control={
                    <Switch
                        onChange={handleChange}
                        id={field.id}
                        color="primary"
                />}
                label={field.label}
            />
        )
    } else {
        return (
            <TextField
                key={field.id}
                id={field.id}
                label={field.label}
                variant="outlined"
                fullWidth
                margin="normal"
                required={field.required}
                type={field.type}
                multiline={field.multiline}
                minRows="10"
                onChange={handleChange}
                error={field.error}
                helperText={field.error ? field.errorText : ''}
                disabled={sending}
            />
        )
    }
}

const Contact = () => {

    const context = useGlobalContext();
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
            type: FIELD_TYPE_TEXT,
            hidden: true,
            default: null
        }
    ]);

    // Build a map that contains all field values
    const [values, setValues] = React.useState(fields.current.reduce((values, field) => {
        return {
            ...values,
            [field.id]: field.default
        }
    }, {/* empty map */}));

    const [isValid, setIsValid] = React.useState(false);

    const [result, setResult] = React.useState({
        status: 'success',
        message: null
    })

    const [sending, setSending] = React.useState(false);

    const onSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        const documentProperties = {
            ...values
        };
        context.dataProvider.sendMessage(documentProperties)
        .then(() => {
            setResult({
                key: uniqueID(),
                status: 'success',
                message: 'Votre message a bien été envoyé. Merci!'
            })
            fields.current.forEach(f => f.isDirty = false);
        })
        .catch((error) => {
            setResult({
                key: uniqueID(),
                status: 'error',
                message: 'Une erreur est survenue lors de l\'envoi de votre message...'
            })
        })
        .finally(() => {
            setSending(false);
        })
    }

    useEffect(() => {
        let isValid = true;

        fields.current.forEach(field => {
            const fieldValue = values[field.id];
            if (fieldValue === null ||
                (field.type === FIELD_TYPE_TEXT && fieldValue.length === 0) ||
                (field.type === FIELD_TYPE_EMAIL && !validateEmail(fieldValue))) {
                isValid = false;
                // No break with forEach...
            }
        })
        setIsValid(isValid);
    }, [values])

    const onCaptchaChange = useCallback((value) => {
        setValues(oldValues => {
            return {
                ...oldValues,
                "token": value
            }
        })
    }, []);

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleChange = (event) => {
        const fieldId = event.target.id;
        const field = fields.current.find(f => f.id === fieldId);
        field.isDirty = true;

        let fieldValue = null;
        if (field.type === FIELD_TYPE_SWITCH) {
            fieldValue = event.target.checked;
        } else {
            fieldValue = event.target.value.trim();
            if (field.type === FIELD_TYPE_EMAIL) {
                field.error = !validateEmail(fieldValue);
            } else {
                field.error = fieldValue.length === 0;
            }
        }

        setValues(oldValues => {
            return {
                ...oldValues,
                [fieldId]: fieldValue
            }
        })
    }

    const isDirty = fields.current.findIndex(f => f.isDirty === true) !== -1;

    return (
        <React.Fragment>
            <PageTitle>Pour me contacter</PageTitle>

            <Stack spacing={2} alignItems="center">
            {
                fields.current.filter(field => !field.hidden).map(field => <FormField key={field.id} field={field} handleChange={handleChange} sending={sending} />)
            }
                <ReCAPTCHA
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    onChange={onCaptchaChange}
                />
            </Stack>
            <LoadingButton
                sx={{mt: 3}}
                onClick={onSubmit}
                variant="contained"
                disabled={!isValid}
                startIcon={<SendIcon />}
                loadingPosition="start"
                loading={sending}
                >
                Envoyer
            </LoadingButton>

            <FeedbackMessage key={result.key} severity={result.severity} message={result.message} />

            <Prompt when={isDirty} message={"Votre message n'a pas été envoyé après les dernières modifications.\nContinuer la navigation?"} />

        </React.Fragment>
    );
}

export default Contact