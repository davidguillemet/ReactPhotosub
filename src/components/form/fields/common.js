import {
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_PASSWORD,
    FIELD_TYPE_PASSWORD_CONFIRM
} from '../FormContext';
import { validateEmail } from 'utils';

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

export function validateFieldValue(field, fieldValue, values) {
    let isError = false;
    if (typeof fieldValue === "string") {
        const isEmpty = 
            (field.type === FIELD_TYPE_PASSWORD || field.type === FIELD_TYPE_PASSWORD_CONFIRM) ?
            fieldValue.length === 0 :
            fieldValue.trim().length === 0;
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

    if (isError === false && field.type === FIELD_TYPE_PASSWORD_CONFIRM) {
        const passwordValue = values[field.passwordId];
        isError = passwordValue !== fieldValue;
    }

    isError = isError || isInvalidValue(field, fieldValue);

    return !isError;
}
