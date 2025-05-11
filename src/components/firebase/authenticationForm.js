import React from 'react';
import { isMobile } from 'react-device-detect';
import { Stack } from '@mui/material';
import Form, {
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_TEXT,
    FIELD_TYPE_PASSWORD,
    FIELD_TYPE_PASSWORD_CONFIRM
} from 'components/form';
import { useTranslation } from 'utils';
import { useDataProvider } from 'components/dataProvider';
import useFirebaseContext from './firebaseContextHook';
import { Button } from '@mui/material';
import { Body } from 'template/pageTypography';
import { useToast } from 'components/notifications';

import { validateEmail, validatePassword } from 'utils';

import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';

const STEP = {
    CHECK_EMAIL: "check_email",
    LOGIN_ENTER_PASSWORD: "login_enter_password",
    CREATE_ACCOUNT: "create_account" ,
    COMPLETED: "completed"
};

const INITIAL_STEP = {
    id: STEP.CHECK_EMAIL,
    data: null
};

const CustomButtons = ({onCancel, onPrev, step}) => {
    const t = useTranslation("components.form::authentication");
    return (
        <Stack direction={"row"} spacing={2}>
            <Button onClick={onCancel}>
                {t("cancel")}
            </Button>
            {
                onPrev &&
                <Button
                    disabled={step.id !== STEP.LOGIN_ENTER_PASSWORD && step.id !== STEP.CREATE_ACCOUNT}
                    onClick={onPrev}
                    startIcon={<ArrowCircleLeftOutlinedIcon />}
                >
                    { isMobile ? "" : t("previous") }
                </Button>
            }
        </Stack>
    )
}

const ResetPasswordLink = ({values}) => {
    const { toast } = useToast();
    const t = useTranslation("components.form::authentication");
    const firebaseContext = useFirebaseContext();

    const handleResetPasswordClick = React.useCallback(() => {
        const sendPasswordResetEmail = firebaseContext.sendPasswordResetEmail;
        sendPasswordResetEmail(values.email)
        .then(() => {
            toast.success(t("resetPasswordLinkSent"));
        }).catch((error) => {
            if (error.code === "auth/user-not-found") {
                // Unknown eMail
                toast.error(t("resetPasswordUserNotFound"));
            } else {
                // Generic error
                toast.error(t("resetPasswordLinkError"));
            }
        });
    }, [firebaseContext.sendPasswordResetEmail, values.email, t, toast]);

    if (values === null) {
        return null;
    }

    return (
        <Button
            variant='text'
            size="small"
            disabled={!validateEmail(values.email)}
            onClick={handleResetPasswordClick}
            sx={{textTransform: 'none'}}
        >
            {t("linkResetPassword")}
        </Button>
    );
}

const AuthenticationForm = ({onCancel}) => {
    const t = useTranslation("components.form::authentication");
    const firebaseContext = useFirebaseContext();
    const dataProvider = useDataProvider();
    const [ fields, setFields ] = React.useState(null);
    const [ step, setStep ] = React.useState(INITIAL_STEP);

    // Submit action depending on wizard step
    const onSubmitAuthenticationForm = React.useCallback((values) => {
        switch (step.id) {
            case STEP.CHECK_EMAIL: {
                // Just check the eMail that has been entered:
                // 1. it exists, next step is LOGIN_ENTER_PASSWORD
                // 2. else next step is CREATE_ACCOUNT
                const newStep = {
                    data: {
                        email: values.email
                    }
                }
                return dataProvider.getUserByMail(values.email)
                .then((registeredUser) => {
                    newStep.id = STEP.LOGIN_ENTER_PASSWORD;
                    newStep.data.name = registeredUser;
                }).catch(error => {
                    if (error.status === 404) {
                        newStep.id = STEP.CREATE_ACCOUNT;
                    } else {
                        throw error;
                    }
                }).finally(() => {
                    setStep(newStep);
                });
            }
            case STEP.LOGIN_ENTER_PASSWORD:
                // Try to login with the provided password
                // readonly fields are removed from submitted values
                // -> read email from the step data
                return firebaseContext.signIn(step.data.email, values.password)
                .then((userCredential) => {
                    setStep(prevStep => ({ 
                        id: STEP.COMPLETED,
                        data: {
                            ...prevStep.data,
                            password: values.password
                        }
                    }));
                }).catch(_ => {
                    throw new Error(t("authenticationFailed"));
                });

            case STEP.CREATE_ACCOUNT:
                // Check password confirmation
                const newStep = {
                    data: {
                        ...step.data,
                        name: values.name,
                        password: values.password
                    }
                };
                if (values.password !== values.password_confirm) {
                    setStep({
                        id: step.id, // Keep the same step
                        ...newStep
                    });
                    return Promise.reject(new Error(t("error:passwordConfirmToast")))
                }
                return dataProvider.createUser({
                    email: step.data.email, // Not in values since readonly field
                    displayName: values.name,
                    password: values.password
                }).then((_uid) => {
                    return firebaseContext.signIn(step.data.email, values.password)
                }).then(() => {
                    return firebaseContext.sendEmailVerification();
                }).then(() => {
                    setStep(prevStep => ({ 
                        ...prevStep,
                        id: STEP.COMPLETED,
                        data: {
                            ...prevStep.data,
                            password: values.password
                        }
                    }));
                }).catch(error => {
                    setStep({
                        id: step.id, // Keep the same step
                        ...newStep
                    });
                    throw error;
                });

            default:
                return Promise.reject(new Error(`Unexpected step ${step.id}`));
        }
    }, [step, dataProvider, firebaseContext, t]);

    // CLose Wizard after login
    React.useEffect(() => {
        if (step.id === STEP.COMPLETED) {
            onCancel();
        }
    }, [step, onCancel]);

    // Update form fields depending on wizard step
    React.useEffect(() => {
        if (step.id === STEP.COMPLETED) {
            // Keep the same fields just before closing the dialog
            return;
        }

        const dynamicFields = [
            {
                id: "email",
                label: t("field:email"),
                required: true,
                errorText: t("error:email"),
                type: FIELD_TYPE_EMAIL,
                multiline: false,
                default: null,
                readOnly: step.id !== STEP.CHECK_EMAIL,
                focus: step.id === STEP.CHECK_EMAIL
            }
        ];

        if (step.id === STEP.CREATE_ACCOUNT) {
            dynamicFields.push({
                id: "name",
                label: t("field:name"),
                required: step.id === STEP.CREATE_ACCOUNT,
                errorText: t("error:name"),
                type: FIELD_TYPE_TEXT,
                multiline: false,
                default: null,
                focus: step.id === STEP.CREATE_ACCOUNT
            });
        }

        if (step.id === STEP.LOGIN_ENTER_PASSWORD || step.id === STEP.CREATE_ACCOUNT) {
            dynamicFields.push({
                id: "password",
                label: t("field:password"),
                required: step.id === STEP.CREATE_ACCOUNT || step.id === STEP.LOGIN_ENTER_PASSWORD,
                // No information about password rules if LOGIN_ENTER_PASSWORD
                errorText: step.id === STEP.LOGIN_ENTER_PASSWORD ? t("error:passwordEnter") : t("error:passwordCreate"),
                type: FIELD_TYPE_PASSWORD,
                multiline: false,
                default: "",
                focus: step.id === STEP.LOGIN_ENTER_PASSWORD,
                // Validator for CREATE_ACCOUNT only
                validator: step.id === STEP.LOGIN_ENTER_PASSWORD ? null : (_field, value) => {
                    return validatePassword(value);
                }
            });
        }

        if (step.id === STEP.CREATE_ACCOUNT) {
            dynamicFields.push({
                id: "password_confirm",
                label: t("field:passwordConfirm"),
                required: step.id === STEP.CREATE_ACCOUNT || step.id === STEP.LOGIN_ENTER_PASSWORD,
                errorText: t("error:passwordConfirm"),
                type: FIELD_TYPE_PASSWORD_CONFIRM,
                passwordId: "password",
                multiline: false,
                default: ""
            });
        }

        setFields(dynamicFields);
    }, [t, step]);

    const handleCancel = React.useCallback(() => {
        if (onCancel) onCancel()
    }, [onCancel]);

    const handleOnPrevious = React.useCallback(() => {
        setStep(INITIAL_STEP);
    }, []);

    // Submit button caption depending on wizard step
    const prevStep = React.useRef();
    const getSubmitButtonCaption = (stepId) => {
        if (stepId !== STEP.COMPLETED) {
            prevStep.current = stepId;
        }
        switch (stepId) {
            case STEP.CHECK_EMAIL:
                return t("next");
            case STEP.LOGIN_ENTER_PASSWORD:
                return t("login");
            case STEP.CREATE_ACCOUNT:
                return t("createAccount");
            case STEP.COMPLETED:
                return getSubmitButtonCaption(prevStep.current);
            default:
                // Should not happen...
                return "";
        }
    };

    const submitButtonCaption = getSubmitButtonCaption(step.id);

    // validation message only in case we create a new account
    const validationMessage =
        step.id === STEP.LOGIN_ENTER_PASSWORD ? t("userConnected", step.data.name) :
        step.id === STEP.CREATE_ACCOUNT ? t("accountCreated") :
        null;

    const pageSubtitle =
        step.id === STEP.CHECK_EMAIL ? t("subTitle:enterEmail") :
        step.id === STEP.CREATE_ACCOUNT ? t("subTitle:createAccount") :
        step.id === STEP.LOGIN_ENTER_PASSWORD ? t("subTitle:login") :
        "";

    return (
        <React.Fragment>
            <Body sx={{mt: 0, mb: 2, "white-space": "pre-wrap"}}>{pageSubtitle}</Body>
            <Form
                fields={fields}
                initialValues={step.data}
                submitAction={onSubmitAuthenticationForm}
                submitCaption={submitButtonCaption}
                validationMessage={validationMessage}
                startCustomComponent={<CustomButtons onCancel={handleCancel} onPrev={handleOnPrevious} step={step} />}
                endCustomComponent={ResetPasswordLink}
                submitIcon={<ArrowCircleRightOutlinedIcon/>}
                submitIconPosition="end"
            />
        </React.Fragment>
    )
}

export default AuthenticationForm;