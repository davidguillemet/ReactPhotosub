import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { PageTitle } from '../../template/pageTypography';
import { Button } from '@material-ui/core';
import { firebaseDb } from  '../../components/firebase';
import FeedbackMessage from '../../components/feedback/Feedback';
import { uniqueID } from '../../utils';

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

    const onSubmit = (e) => {
        e.preventDefault();
        const documentProperties = {
            ...values
        };
        const collection = firebaseDb().collection("mail");
        collection.add(documentProperties)
        .then((docRef) => {
            setResult({
                key: docRef.id,
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
        });
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

    const handleChange = (event) => {
        const fieldId = event.target.id;
        const fieldValue = event.target.value.trim();
        const field = fields.current.find(f => f.id === fieldId);
        field.error = fieldValue.length === 0;
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

            {
                fields.current.map(field => (
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
                    />
                ))
            }

            <Button
                sx={{mt: 3}}
                onClick={onSubmit}
                variant="contained"
                disabled={!isValid}
            >
                Envoyer
            </Button>

            <FeedbackMessage key={result.key} severity={result.severity} message={result.message} />
        </React.Fragment>
    );
}

export default Contact;