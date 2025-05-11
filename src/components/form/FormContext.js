import React from 'react';
import { useToast } from '../notifications';
import { useOverlay } from '../loading/loadingOverlay';
import {
    TagsField,
    SelectControl,
    CheckBoxField,
    SwitchField,
    CaptchaField,
    GenericTextField,
    LatLongField
} from './fields';

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
export const FIELD_TYPE_PASSWORD_CONFIRM = 'passwordConfirm';
export const FIELD_TYPE_LATLONG = "latlong";
export const FIELD_TYPE_CAPTCHA = 'reCaptcha';

const FormContext = React.createContext(null);

const _FormFields = {
    [FIELD_TYPE_SWITCH]: SwitchField,
    [FIELD_TYPE_CHECK_BOX]: CheckBoxField,
    [FIELD_TYPE_SELECT]: SelectControl,
    [FIELD_TYPE_TEXT]: GenericTextField,
    [FIELD_TYPE_TAGS_FIELD]: TagsField,
    [FIELD_TYPE_NUMBER]: GenericTextField,
    [FIELD_TYPE_EMAIL]: GenericTextField,
    [FIELD_TYPE_URL]: GenericTextField,
    [FIELD_TYPE_DATE]: GenericTextField,
    [FIELD_TYPE_PASSWORD]: GenericTextField,
    [FIELD_TYPE_PASSWORD_CONFIRM]: GenericTextField,
    [FIELD_TYPE_LATLONG]: LatLongField,
    [FIELD_TYPE_CAPTCHA]: CaptchaField
};

export const getFieldSpecFromField = (field) => {
    const [ FieldComponent, fieldValidator ] = _FormFields[field.type];
    const validator = field.validator || fieldValidator;
    return {
        id: field.id,
        field,
        component: FieldComponent,
        isValid: (value, values) => {
            return validator(field, value, values);
        }
    }
}

const getFieldSpecs = (fields) => {
    return fields !== null ? fields.map(field => getFieldSpecFromField(field)) : null;
};

const getValuesFromFields = (fieldSpecs, initialValues) => {
    const values = fieldSpecs
    .map(fieldSpec => fieldSpec.field)
    .reduce((values, field) => {
        const newValues = {
            ...values,
            [field.id]: initialValues && Object.hasOwn(initialValues, field.id) ? initialValues[field.id] : field.default
        };
        return newValues;
    }, {/* empty map */});
    return values;
}

export const FormContextProvider = (props) => {

    const {
        nativeFields,
        initialValues = null,
        submitAction,
        onCancel = null,
        validationMessage = "Les modifications ont été enregistrées avec succès.",
        onChange = null,
        readOnly = false,
        children
    } = props;

    const fieldSpecs = React.useMemo(() => getFieldSpecs(nativeFields), [nativeFields]);

    const { toast } = useToast();
    const [errors, setErrors] = React.useState(new Set());
    const [values, setValues] = React.useState(() => getValuesFromFields(fieldSpecs, initialValues));
    const [isDirty, setIsDirty] = React.useState(false);


    const { overlay: sending, setOverlay: setSending } = useOverlay();

    React.useEffect(() => {
        setValues(getValuesFromFields(fieldSpecs, initialValues));
    }, [fieldSpecs, initialValues]);

    React.useEffect(() => {
        if (readOnly && errors.size > 0) {
            setErrors(new Set());
        }
    }, [readOnly, errors]);

    const setFieldError = React.useCallback((field, error) => {
        if (error) {
            setErrors(prevErrors => {
                prevErrors.add(field.id);
                return new Set(prevErrors);
            });
        } else {
            setErrors(prevErrors => {
                prevErrors.delete(field.id);
                return new Set(prevErrors);
            });
        }
    }, []);

    const handleChange = React.useCallback((fieldSpec, fieldValue) => {
        const field = fieldSpec.field;

        // reset dependencies
        const dependencies = [];
        if (field.dependencies) {
            field.dependencies.forEach(dep => dependencies[dep] = "");
        }

        if (onChange) {
            onChange(field, fieldValue);
        }

        setIsDirty(true);
        setFieldError(field, fieldSpec.isValid(fieldValue, values) === false);
        setValues(oldValues => {
            return {
                ...oldValues,
                [field.id]: fieldValue,
                ...dependencies
            }
        })
    }, [onChange, setFieldError, values]);

    const onSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        const formValues = {};

        // Remove readonly field values
        // And remove leading/trailing spaces for string values
        fieldSpecs.forEach(fieldSpec => {
            const f = fieldSpec.field;
            if (!f.readOnly) {
                let fieldValue = values[f.id];
                if (typeof fieldValue === "string" &&
                    f.type !== FIELD_TYPE_PASSWORD &&
                    f.type !== FIELD_TYPE_PASSWORD_CONFIRM) {
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
            if (validationMessage) {
                toast.success(validationMessage);
            }
        }).catch((error) => {
            toast.error(error.message);
        }).finally(() => {
            setSending(false);
        })
    }

    const hasError = React.useCallback((fieldId) => {
        return errors.has(fieldId);
    }, [errors]);

    const checkValidity = () => {
        return fieldSpecs.every(fieldSpec => fieldSpec.isValid(values[fieldSpec.field.id], values))
    };

    const formContext = {
        handleChange,
        onSubmit,
        hasError,
        sending,
        isDirty,
        isValid: checkValidity(),
        readOnly,
        fieldSpecs,
        values
    };

    return (
        <FormContext.Provider value={formContext}>
          { children }
        </FormContext.Provider>
    )

};

export function useFormContext() {
    const context = React.useContext(FormContext);
    if (context === undefined || context === null) {
        throw new Error("useFormContext must be used within an FormContextProvider");
    }
    return context;
}
