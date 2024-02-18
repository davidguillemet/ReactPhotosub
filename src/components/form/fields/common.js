import { FIELD_TYPE_EMAIL } from '../Form';

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isInvalidValue(field, value) {
    if (!field.invalidValues) {
        return false;
    }
    return field.invalidValues.includes(value);
}

export function validateValueRange(value, range) {
    if (value === undefined || value === null || isNaN(value)) {
        return false;
    }

    if (value < range.min || value > range.max) {
        return false;
    }

    return true;
}

export function validateFieldValue(field, fieldValue) {
    let isError = false;
    if (typeof fieldValue === "string") {
        const isEmpty = fieldValue.trim().length === 0;
        if (field.type === FIELD_TYPE_EMAIL) {
            isError = (isEmpty === false && !validateEmail(fieldValue)) || (field.required && isEmpty === true);
        } else {
            isError = field.required && isEmpty === true;
        }
    } else if (fieldValue === undefined || fieldValue === null || isNaN(fieldValue)) {
        isError = field.required;
    } else if (field.range) {
        isError = validateValueRange(fieldValue, field.range) === false;
    }

    isError = isError || isInvalidValue(field, fieldValue);

    return !isError;
}
