import React from 'react';
import { useToast } from '../notifications';
import { useOverlay } from '../loading/loadingOverlay';

const FormContext = React.createContext(null);

const getValuesFromFields = (fields, initialValues) => {
    const values = fields.reduce((values, field) => {
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
        fields,
        initialValues = null,
        submitAction,
        onCancel = null,
        validationMessage = "Les modifications ont été enregistrées avec succès.",
        onChange = null,
        readOnly = false,
        children
    } = props;

    const { toast } = useToast();
    const [errors, setErrors] = React.useState(new Set());
    const [values, setValues] = React.useState(() => getValuesFromFields(fields, initialValues));
    const [isDirty, setIsDirty] = React.useState(false);
    const validators = React.useRef(new Map());

    const { overlay: sending, setOverlay: setSending } = useOverlay();

    React.useEffect(() => {
        setValues(getValuesFromFields(fields, initialValues));
    }, [fields, initialValues]);

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

    const handleChange = React.useCallback((field, fieldValue) => {
        // reset dependencies
        const dependencies = [];
        if (field.dependencies) {
            field.dependencies.forEach(dep => dependencies[dep] = "");
        }

        if (onChange) {
            onChange(field, fieldValue);
        }

        setIsDirty(true);
        const validator = validators.current.get(field.id);
        setFieldError(field, validator(field, fieldValue) === false);
        setValues(oldValues => {
            return {
                ...oldValues,
                [field.id]: fieldValue,
                ...dependencies
            }
        })
    }, [onChange, setFieldError]);

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

    const hasError = React.useCallback((field) => {
        return errors.has(field.id);
    }, [errors]);

    const registerValidator = React.useCallback((fieldId, validator) => {
        validators.current.set(fieldId, validator);
    }, []);

    const checkValidity = () => {
        let isValid = true;
        fields.forEach(field => {
            if (!validators.current.has(field.id) ||
                validators.current.get(field.id)(field, values[field.id]) ===  false) {
                isValid = false;
            }
        });
        return isValid;
    }

    const isValid =
        validators.current.size === fields.length ?
        checkValidity() :
        false; // Missing validators

    const formContext = {
        handleChange,
        onSubmit,
        hasError,
        registerValidator,
        sending,
        isDirty,
        isValid,
        readOnly,
        fields,
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
