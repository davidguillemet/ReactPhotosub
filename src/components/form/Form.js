import React, { useEffect, useRef } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import Stack from '@mui/material/Stack';
import FormField from './FormField';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@mui/material';
import { useToast } from '../notifications';
import LoadingOverlay from '../loading/loadingOverlay';

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
    const [errors, setErrors] = React.useState({});
    const { toast } = useToast();

    // Used to check if we must validate a field or not
    // -> not modified = don't check (or all fields will be invalid at the beginning)
    // -> modified = check field validity
    const modifiedFields = useRef(new Set());

    const [sending, setSending] = React.useState(false);
    const [isValid, setIsValid] = React.useState(false);
    const [isDirty, setIsDirty] = React.useState(false);

    const onCaptchaChange = React.useCallback((value) => {
        setValues(oldValues => {
            return {
                ...oldValues,
                "token": value
            }
        })
    }, []);

    useEffect(() => {
        setValues(getValuesFromFields(fields, initialValues));
    }, [fields, initialValues]);

    useEffect(() => {
        const newErrors = {};
        fields.forEach(field => {
            if (modifiedFields.current.has(field.id)) {
                // UPdate error only for modified fields
                // Otherwise, all fields are on error at the beginning...
                const fieldValue = values[field.id];
                let isError = false;
                if (typeof fieldValue === "string") {
                    const isEmpty = fieldValue.trim().length === 0;
                    if (field.type === FIELD_TYPE_EMAIL) {
                        isError = field.required && (isEmpty === true || !validateEmail(fieldValue));
                    } else {
                        isError = field.required && isEmpty === true;
                    }
                } else if (fieldValue === undefined || fieldValue === null) {
                    isError = field.required;
                }
                newErrors[field.id] = isError;
            }
        })
        setErrors(newErrors);
    }, [values, fields]);

    useEffect(() => {
        let isValid = true;
        fields.forEach(field => {
            if (errors[field.id]) {
                isValid = false;
                // No break with forEach...
            }
        })
        setIsValid(isValid);
    }, [errors, fields])

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleChange = (event) => {
        const fieldId = event.target.id || event.target.name;
        const field = fields.find(f => f.id === fieldId);
        modifiedFields.current.add(fieldId);

        let fieldValue = null;
        if (field.type === FIELD_TYPE_SWITCH || field.type === FIELD_TYPE_CHECK_BOX) {
            fieldValue = event.target.checked;
        } else {
            fieldValue = event.target.value;
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
        const formValues = {};

        // Remove readonly field values
        // And remove leading/trailing spaces for string values
        fields.forEach(f => {
            if (!f.readOnly) {
                let fieldValue = values[f.id];
                if (typeof fieldValue === "string") {
                    fieldValue = fieldValue.trim();
                }
                formValues[f.id] = fieldValue;
            }
        });

        submitAction(formValues)
        .then(() => {
            if (onCancel) {
                onCancel();
            }
            toast.success(validationMessage);
        }).catch((error) => {
            toast.error(error.message);
        }).finally(() => {
            setSending(false);
        })
    }

    return (
        <React.Fragment>
            <Stack spacing={2} alignItems="center">
            {
                fields.filter(field => !field.hidden).map(field => 
                    <FormField
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        error={errors[field.id]}
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

            </Stack>

            <LoadingOverlay open={sending} />

        </React.Fragment>
    )
}

export default Form;