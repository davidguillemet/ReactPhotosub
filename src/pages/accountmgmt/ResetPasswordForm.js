import React from 'react';
import Form, {
    FIELD_TYPE_PASSWORD,
    FIELD_TYPE_PASSWORD_CONFIRM
} from 'components/form';
import { useTranslation, validatePassword } from 'utils';

const ResetPasswordForm = ({onNewPassword}) => {

    const t = useTranslation("pages.accountManagement");

    const resetPasswordFields = React.useRef([
        {
            id: "password",
            label: t("field:password"),
            required: true,
            // No information about password rules if LOGIN_ENTER_PASSWORD
            errorText: t("error:passwordCreate"),
            type: FIELD_TYPE_PASSWORD,
            multiline: false,
            default: "",
            focus: true,
            validator: (_field, value) => validatePassword(value)
        },
        {
            id: "password_confirm",
            label: t("field:passwordConfirm"),
            required: true,
            errorText: t("error:passwordConfirm"),
            type: FIELD_TYPE_PASSWORD_CONFIRM,
            passwordId: "password",
            multiline: false,
            default: ""
        }
    ]);

    const onSubmitNewPassword = React.useCallback((values) => {
        if (values.password !== values.password_confirm) {
            return Promise.reject(new Error(t("error:passwordConfirmFailure")))
        }
        return onNewPassword(values.password);
    }, [t, onNewPassword]);

    return (
        <Form
            fields={resetPasswordFields.current}
            initialValues={null}
            submitAction={onSubmitNewPassword}
            validationMessage={t("resetPasswordSuccess")}
        />
    )
}

export default ResetPasswordForm;