import React from 'react';
import { useDarkMode } from 'components/theme';
import ReCAPTCHA from "react-google-recaptcha";

const validateCaptcha = (value) => {
    return value !== null;
};
const CaptchaField = ({ field, value, values, handleChange, sending, validators }) => {

    const { darkMode } = useDarkMode();
    const onCaptchaChange = React.useCallback((value) => {
        handleChange(field, value);
    }, [handleChange, field]);

    React.useEffect(() => {
        validators[field.id] = validateCaptcha;
    }, [field, validators]);

    return (
        <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            onChange={onCaptchaChange}
            theme={darkMode ? "dark" : "light"}
        />
    );
};

export default CaptchaField;
