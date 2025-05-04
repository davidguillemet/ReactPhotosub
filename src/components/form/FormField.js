import React, { useRef } from 'react';

import {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_TAGS_FIELD,
    FIELD_TYPE_NUMBER,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_URL,
    FIELD_TYPE_CHECK_BOX,
    FIELD_TYPE_SELECT,
    FIELD_TYPE_SWITCH,
    FIELD_TYPE_DATE,
    FIELD_TYPE_PASSWORD,
    FIELD_TYPE_LATLONG,
    FIELD_TYPE_CAPTCHA
} from './Form';

import {
    TagsField,
    SelectControl,
    CheckBoxField,
    SwitchField,
    CaptchaField,
    GenericTextField,
    LatLongField
} from './fields';
import { useFormContext } from './FormContext';

export const FormField = (props) => {

    const formContext = useFormContext();

    const FormFields = useRef({
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
        [FIELD_TYPE_LATLONG]: LatLongField,
        [FIELD_TYPE_CAPTCHA]: CaptchaField
    });

    const { field } = props;
    const [ FieldComponent, fieldValidator ] = FormFields.current[field.type];

    // Validator might be overridden at field level, for example for password
    // validation depending on specific rules (see authenticationForm)
    formContext.registerValidator(field.id, field.validator || fieldValidator);

    return <FieldComponent {...props} />
};
