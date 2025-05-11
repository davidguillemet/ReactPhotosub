import React from 'react';
import { useDarkMode } from 'components/theme';
import ReCAPTCHA from "react-google-recaptcha";

const validateCaptcha = (_field, value) => {
    return value !== null;
};

const CaptchaFieldComp = ({ fieldSpec, handleChange }) => {

    const { darkMode } = useDarkMode();
    const onCaptchaChange = React.useCallback((value) => {
        handleChange(fieldSpec, value);
    }, [handleChange, fieldSpec]);

    return (
        <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            onChange={onCaptchaChange}
            theme={darkMode ? "dark" : "light"}
        />
    );
};

const CaptchaField = [ CaptchaFieldComp, validateCaptcha ];
export default CaptchaField;
