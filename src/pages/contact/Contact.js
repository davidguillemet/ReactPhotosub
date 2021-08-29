import React, { useEffect } from 'react';
import Stack from '@material-ui/core/Stack';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import LoadingButton from '@material-ui/lab/LoadingButton';
import SendIcon from '@material-ui/icons/Send';
import { PageTitle } from '../../template/pageTypography';
import FeedbackMessage from '../../components/feedback/Feedback';
import { uniqueID } from '../../utils';
import dataProvider from '../../dataProvider';

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

    const fields = React.useRef([
        {
            id: "name",
            label: "Votre nom",
            required: true,
            errorText: "Merci d'indiquer votre nom.",
            type: "text",
            multiline: false
        },
        {
            id: "email",
            label: "Votre adresse de messagerie",
            required: true,
            errorText: "Merci d'indiquer une adresse de messagerie valide.",
            type: "email",
            multiline: false
        },
        {
            id: "subject",
            label: "Le titre de votre message",
            required: true,
            errorText: "Merci d'indiquer l'objet de votre message.",
            type: "text",
            multiline: false
        },
        {
            id: "message",
            label: "Votre message",
            required: true,
            errorText: "Merci de saisir un message.",
            type: "text",
            multiline: true
        },
        {
            id: "sendcopy",
            label: "Recevoir une copie de votre message",
            type: "switch",
        },
    ]);

    // Build a map that contains all field values
    const [values, setValues] = React.useState(fields.current.reduce((values, field) => {
        return {
            ...values,
            [field.id]: ''
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
        dataProvider.sendMessage(documentProperties)
        .then(() => {
            setResult({
                key: uniqueID(),
                status: 'success',
                message: 'Votre message a bien été envoyé. Merci!'
            })
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
        for (let key in values) {
            if (values[key].length === 0) {
                isValid = false;
                break;
            }
        }
        setIsValid(isValid);
    }, [values])

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleChange = (event) => {
        const fieldId = event.target.id;
        const field = fields.current.find(f => f.id === fieldId);

        let fieldValue = null;
        if (field.type === "switch") {
            fieldValue = event.target.checked;
        } else {
            fieldValue = event.target.value.trim();
            if (field.type === "email") {
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

    return (
        <React.Fragment>
            <PageTitle>Pour me contatcter</PageTitle>

            <Stack alignItems="center">
            {
                fields.current.map(field => <FormField field={field} handleChange={handleChange} sending={sending} />)
            }
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
        </React.Fragment>
    );
}

export default Contact