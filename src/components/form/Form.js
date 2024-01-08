import React, { useEffect } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import Stack from '@mui/material/Stack';
import { FormField }from './FormField';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import { Button } from '@mui/material';
import { useToast } from '../notifications';
import { useOverlay } from '../loading/loadingOverlay';
import { useTranslation } from 'utils';

export const FIELD_TYPE_TEXT = 'text';
export const FIELD_TYPE_TAGS_FIELD = 'tagsField';
export const FIELD_TYPE_NUMBER = 'number';
export const FIELD_TYPE_EMAIL = 'email';
export const FIELD_TYPE_URL = 'url';
export const FIELD_TYPE_SWITCH = 'switch';
export const FIELD_TYPE_DATE = 'date';
export const FIELD_TYPE_SELECT = 'select';
export const FIELD_TYPE_CHECK_BOX = 'checkbox';
export const FIELD_TYPE_PASSWORD = 'password';
export const FIELD_TYPE_LATLONG = "latlong";
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

    const t = useTranslation("components.form");
    const [values, setValues] = React.useState({});
    const validators = React.useRef({});
    const { toast } = useToast();

    const { overlay: sending, setOverlay: setSending } = useOverlay();
    const [isValid, setIsValid] = React.useState(false);
    const [isDirty, setIsDirty] = React.useState(false);

    useEffect(() => {
        setValues(getValuesFromFields(fields, initialValues));
    }, [fields, initialValues]);

    useEffect(() => {
        let isValid = true;
        fields.forEach(field => {
            if (validators.current[field.id](values[field.id]) === false) {
                isValid = false;
            }
        })
        setIsValid(isValid);
    }, [fields, values]);

    const handleChange = React.useCallback((field, fieldValue) => {
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
                    [field.id]: fieldValue,
                    ...dependencies
                }
            })
        });
    }, [onChange]);

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
            <Stack spacing={2} alignItems="center" sx={{width: '100%', paddingTop: 1}}>
            {
                fields.filter(field => !field.hidden).map(field => 
                    <FormField
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        values={values}
                        handleChange={handleChange}
                        sending={sending}
                        readOnly={readOnly}
                        validators={validators.current}
                    />
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
                            {t("btn:cancel")}
                        </Button>
                    }
                </Stack>
            }

            </Stack>

        </React.Fragment>
    )
}

export default Form;