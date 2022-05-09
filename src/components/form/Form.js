import React, { useEffect } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import Stack from '@mui/material/Stack';
import FormField from './FormField';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@mui/material';
import FeedbackMessage from '../feedback/Feedback';
import { uniqueID } from '../../utils';

export const FIELD_TYPE_TEXT = 'text';
export const FIELD_TYPE_EMAIL = 'email';
export const FIELD_TYPE_SWITCH = 'switch';
export const FIELD_TYPE_DATE = 'date';
export const FIELD_TYPE_SELECT = 'select';
export const FIELD_TYPE_CHECK_BOX = 'checkbox';
export const FIELD_TYPE_PASSWORD = 'password';
export const FIELD_TYPE_CAPTCHA = 'reCaptcha';

const getValuesFromFields = (fields, initialValues) => {
    return fields.reduce((values, field) => {
        return {
            ...values,
            [field.id]: initialValues && initialValues[field.id] ? initialValues[field.id] : field.default
        }
    }, {/* empty map */})
}

const Form = ({
    fields,
    initialValues = null,
    submitAction,
    onCancel = null,
    submitCaption = "Envoyer",
    validationMessage = "Les modifications ont été enregistrées avec succès.",
    onChange = null,
    readOnly = false}) => {

    const [values, setValues] = React.useState(() => getValuesFromFields(fields, initialValues));

    useEffect(() => {
        setValues(getValuesFromFields(fields, initialValues));
    }, [fields, initialValues]);

    const [sending, setSending] = React.useState(false);
    const [isValid, setIsValid] = React.useState(false);
    const [isDirty, setIsDirty] = React.useState(false);

    const [result, setResult] = React.useState({
        status: 'success',
        message: null,
        key: null // uniqueID()
    })

    const onCaptchaChange = React.useCallback((value) => {
        setValues(oldValues => {
            return {
                ...oldValues,
                "token": value
            }
        })
    }, []);

    useEffect(() => {
        let isValid = true;

        fields.forEach(field => {
            const fieldValue = values[field.id];
            if (fieldValue === null ||
                (field.type === FIELD_TYPE_TEXT && field.required === true && fieldValue.length === 0) ||
                (field.type === FIELD_TYPE_EMAIL && !validateEmail(fieldValue)) ||
                (field.type === FIELD_TYPE_SELECT && field.required === true && fieldValue.length === 0) ||
                (field.type === FIELD_TYPE_DATE && field.required === true && fieldValue.length === 0)) {
                isValid = false;
                // No break with forEach...
            }
        })
        setIsValid(isValid);
    }, [values, fields])

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleChange = (event) => {
        const fieldId = event.target.id || event.target.name;
        const field = fields.find(f => f.id === fieldId);
        field.isDirty = true;

        let fieldValue = null;
        if (field.type === FIELD_TYPE_SWITCH || field.type === FIELD_TYPE_CHECK_BOX) {
            fieldValue = event.target.checked;
        } else {
            fieldValue = event.target.value;
            if (typeof fieldValue === "string") {
                fieldValue = fieldValue.trim();
                if (field.type === FIELD_TYPE_EMAIL) {
                    field.error = (field.required || fieldValue.length === 0) && !validateEmail(fieldValue);
                } else {
                    field.error = field.required && fieldValue.length === 0;
                }
            } else if (event.target.value === undefined || event.target.value === null) {
                field.error = field.required;
            }
        }

        // reset dependencies
        const dependencies = [];
        if (field.dependencies) {
            field.dependencies.forEach(dep => dependencies[dep] = "");
        }

        if (onChange) {
            onChange();
        }

        unstable_batchedUpdates(() => {
            setIsDirty(true);
            setValues(oldValues => {
                return {
                    ...oldValues,
                    [fieldId]: fieldValue,
                    ...dependencies
                }
            })
        });
    }

    const onSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        const formValues = {
            ...values
        };
        // Remove readonly field values
        fields.forEach(f => { if (f.readOnly) delete formValues[f.id]; });

        submitAction(formValues)
        .then(() => {
            fields.forEach(f => delete f.isDirty);
            if (onCancel) {
                onCancel();
            }
            setResult({
                key: uniqueID(),
                severity: 'success',
                message: validationMessage
            })
        }).catch((error) => {
            setResult({
                key: uniqueID(),
                severity: 'error',
                message: error.message
            })
        }).finally(() => {
            setSending(false);
        })
    }

    return (
        <Stack spacing={2} alignItems="center">
        {
            fields.filter(field => !field.hidden).map(field => 
                <FormField
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    values={values}
                    handleChange={field.type === FIELD_TYPE_CAPTCHA ? onCaptchaChange : handleChange}
                    sending={sending}
                    readOnly={readOnly} />
            )
        }
        {   
            readOnly === false &&
            <Stack spacing={2} direction="row" sx={{mt: 2}}>
                <LoadingButton
                    onClick={onSubmit}
                    variant="contained"
                    disabled={!isValid || !isDirty}
                    startIcon={<SendIcon />}
                    loadingPosition="start"
                    loading={sending}
                    >
                    {submitCaption}
                </LoadingButton>
                {
                    onCancel !== null &&
                    <Button variant="contained" onClick={onCancel}>
                        Annuler
                    </Button>
                }
            </Stack>
        }

            <FeedbackMessage key={result.key} severity={result.severity} message={result.message} />

        </Stack>
    )
}

export default Form;