import React from 'react';
import { useTranslation, useQueryParameter } from 'utils';
import { Loading } from 'components/hoc';
import { useFirebaseContext } from 'components/firebase';
import { PageTitle, Paragraph } from 'template/pageTypography';
import { Alert } from '@mui/material';
import { VerticalSpacing } from 'template/spacing';
import ResetPasswordForm from './ResetPasswordForm';

const STEP = {
    ENTER_PASSWORD: "enter_password",
    PASSWORD_CHANGED: "password_changed"
};

const getMessageFromActionMode = (mode) => {
    switch (mode) {
        case 'resetPassword':
            return {
                titleKey: "title:resetPassword",
                messageKey: "verifyResetPasswordCode",
                processing: true
            };
        case 'recoverEmail':
            // Display email recovery handler and UI.
            //handleRecoverEmail(firebaseContext.auth, actionCode, lang);
            return null;
        case 'verifyEmail':
            return {
                titleKey: "title:verifyMailAddress",
                messageKey: "verifyMailAddress",
                processing: true
            };
        default:
            return null;
    }
}

// Just display a loading state while the action is verified
// then display a validation message in a toast while redirecting to the target page (continueUrl)
const AccountManagement = () => {
    const t = useTranslation("pages.accountManagement");
    const firebaseContext = useFirebaseContext();
    const getQueryParameter = useQueryParameter();

    // Get the action to complete.
    const mode = getQueryParameter("mode");

    const [ message, setMessage ] = React.useState(getMessageFromActionMode(mode));
    const actionCode = React.useRef(null);

    const resetPasswordEmail = React.useRef(null);

    React.useEffect(() => {

        const newActionCode = getQueryParameter('oobCode');
        if (actionCode.current === newActionCode) {
            // Don't launch the same action twice...
            return;
        }
        // Get the one-time code from the query parameter.
        actionCode.current = newActionCode;

        // (Optional) Get the continue URL from the query parameter if available.
        //const continueUrl = getQueryParameter('continueUrl');

        // Handle the user management action.
        // See https://firebase.google.com/docs/auth/custom-email-handler#create_the_email_action_handler_page
        switch (mode) {
            case 'resetPassword':
                // Display reset password handler and UI.
                firebaseContext.verifyPasswordResetCode(actionCode.current)
                .then((email) => {
                    // Store the user mail address
                    resetPasswordEmail.current = email;
                    setMessage(prevMessage => ({
                        ...prevMessage,
                        messageKey: "enterNewPassword",
                        step: STEP.ENTER_PASSWORD,
                        processing: false
                    }));
                }).catch((error) => {
                    setMessage(prevMessage => ({
                        ...prevMessage,
                        messageKey: "invalidResetPasswordLink",
                        processing: false
                    }));
                });
                break;
            case 'recoverEmail':
                // Display email recovery handler and UI.
                //handleRecoverEmail(firebaseContext.auth, actionCode, lang);
                break;
            case 'verifyEmail':
                // Display email verification handler and UI.
                firebaseContext.applyActionCode(actionCode.current)
                .then((resp) => {
                    setMessage(prevMessage => ({
                        ...prevMessage,
                        messageKey: "mailAddressVerified",
                        processing: false
                    }));
                }).catch((error) => {
                    setMessage(prevMessage => ({
                        ...prevMessage,
                        messageKey: "invalidVerifyMailLink",
                        processing: false
                    }));
                });
                break;
            default:
            // Error: invalid mode.
        }
    }, [getQueryParameter, firebaseContext, mode]);

    const onNewPassword = React.useCallback((newPassword) => {
        const confirmPasswordReset = firebaseContext.confirmPasswordReset;
        return confirmPasswordReset(actionCode.current, newPassword)
        .then((resp) => {
            const signIn = firebaseContext.signIn;
            setMessage(prev => ({
                ...prev,
                messageKey: "resetPasswordSuccess",
                processing: false,
                step: STEP.PASSWORD_CHANGED
            }));
            // sign-in the user with the corresponding email and ne password
            return signIn(resetPasswordEmail.current, newPassword);
        }).catch((error) => {
            throw new Error(t("invalidResetPasswordLink"));
        });
    }, [firebaseContext.confirmPasswordReset, firebaseContext.signIn, t]);

    if (message === null) {
        return (
            <React.Fragment>
                <VerticalSpacing factor={2}></VerticalSpacing>
                <Alert severity='error' variant='filled'>{t("invalidActionLink")}</Alert>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <PageTitle>{t(message.titleKey)}</PageTitle>
            <Paragraph
                sx={{
                    "textAlign": "center",
                    "white-space": "pre-wrap"
                }}
            >
                {t(message.messageKey)}
            </Paragraph>
            { message.processing && <Loading></Loading> }
            {
                message.step === STEP.ENTER_PASSWORD &&
                <ResetPasswordForm onNewPassword={onNewPassword} />
            }
        </React.Fragment>
    )
};

export default AccountManagement;