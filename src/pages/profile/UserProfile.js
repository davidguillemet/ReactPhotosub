import React, { useCallback, useState, useEffect } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageTitle } from '../../template/pageTypography';
import { useAuthContext } from '../../components/authentication';
import { VerticalSpacing } from '../../template/spacing';
import { withUser } from '../../components/hoc';
import { ConfirmDialog } from '../../dialogs';
import EnterPasswordDlg from './EnterPasswordDlg';
import { useToast } from '../../components/notifications';

import Form, {
    FIELD_TYPE_TEXT,
    FIELD_TYPE_EMAIL,
    FIELD_TYPE_CHECK_BOX,
    FIELD_TYPE_PASSWORD
} from '../../components/form';
import { useDataProvider } from '../../components/dataProvider';
import { useTranslation } from 'utils';

const getFormValues = (user) => {
    return {
        "email": user.email,
        "displayName": user.displayName,
        "emailVerified": user.emailVerified,
        "password": "",
        "password_confirm": ""
    }
}

const getFields = (t) => {
    const fields = [
        {
            id: "email",
            label: t("email"),
            required: true,
            errorText: t("emailError"),
            type: FIELD_TYPE_EMAIL,
            multiline: false,
            default: ""
        },
        {
            id: "displayName",
            label: t("name"),
            required: true,
            errorText: t("nameError"),
            type: FIELD_TYPE_TEXT,
            default: ""
        },
        {
            id: "password",
            label: t("password"),
            required: false,
            type: FIELD_TYPE_PASSWORD,
            multiline: false,
            default: ""
        },
        {
            id: "password_confirm",
            label: t("passwordConfirm"),
            required: false,
            type: FIELD_TYPE_PASSWORD,
            multiline: false,
            default: ""
        },
        {
            id: "emailVerified",
            label: t("emailVerified"),
            readOnly: true,
            type: FIELD_TYPE_CHECK_BOX,
            default: false
        },
    ]
    fields.language = t.language;
    return fields;
}

const UserProfile = (props) => {

    const t = useTranslation("pages.profile");
    const authContext = useAuthContext();
    const dataProvider = useDataProvider();
    const { toast } = useToast();

    const [readOnly, setReadOnly] = useState(true);

    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

    const [openPasswordDlg, setOpenPasswordDlg] = useState({
        open: false,
        action: null
    });

    const [ fields, setFields ] = useState(() => getFields(t));

    const [values, setValues] = useState(() => getFormValues(authContext.user));

    useEffect(() => {
        setFields(prevFields => {
            if (prevFields.language !== t.language) {
                return getFields(t);
            }
            return prevFields;
        });
    }, [t]);

    const onIdTokenRevocation = useCallback((email, password) => {
        return authContext.reauthenticateWithCredential(email, password);
    }, [authContext]);

    const onClickModify = useCallback(() => {
        setOpenPasswordDlg({
            open: true,
            action: "modify"
        });
    }, []);

    const onSubmitUserForm = useCallback((values) => {
        // Check possible password + confirmation
        if (values.password.length > 0 || values.password_confirm.length > 0) {
            if (values.password !== values.password_confirm) {
                fields.filter(field => field.id.startsWith("password")).forEach(field => field.error = true);
                return Promise.reject(new Error(t("passwordConfirmError")))
            }
        } else {
            // Delete password from values if field is empty (i.e. no password change)
            delete values.password;
        }
        delete values.password_confirm;
        return dataProvider.updateUser(values)
        .then(() => {
            if (values.password) {
                // Password has been changed, then reauthenticate
                return onIdTokenRevocation(values.email, values.password);
            } else {
                return Promise.resolve();
            }
        })
        .then(() => authContext.reloadUser())
        .then(() => {
            unstable_batchedUpdates(() => {
                setReadOnly(true);
                setValues(oldValues => {
                    return {
                        ...oldValues,
                        ...values
                    }
                })
            });
        })
        .catch(err => {
            if (err.code === "auth/user-token-expired") {
                // A major user account change (password, email) requires re-authentication
                // https://firebase.google.com/docs/auth/admin/manage-sessions
                // -> reauthenticate with new email and password
                return onIdTokenRevocation(values.email, values.password);
            }
            else if (err.cause?.code === "auth/invalid-password") {
                fields.filter(field => field.id.startsWith("password")).forEach(field => field.error = true);
            } else if (err.cause?.code === "auth/invalid-email" || err.cause?.code === "auth/email-already-exists") {
                fields.find(field => field.id === "email").error = true;
            } else if (err.cause?.code === "auth/invalid-display-name") {
                fields.find(field => field.id === "displayName").error = true;
            }
            throw err;
        });
    }, [authContext, dataProvider, onIdTokenRevocation, fields, t]);

    const onCancelChanges = useCallback(() => {
        fields.forEach(field => field.error = false);
        unstable_batchedUpdates(() => {
            setReadOnly(true);
            setValues(getFormValues(authContext.user));
        });
    }, [authContext.user, fields]);

    const onClickDeleteAccount = useCallback(() => {
        setOpenDeleteConfirmation(true);
    }, []);

    const onConfirmDeleteAccount = useCallback(() => {
        setOpenPasswordDlg({
            open: true,
            action: "delete"
        });
        return Promise.resolve();
    }, []);

    const onDeleteAccount = useCallback(() => {
        return authContext.user.delete();
    }, [authContext.user]);

    const onOpenPasswordDlgChanged = useCallback((open) => {
        setOpenPasswordDlg({
            open: open
        })
    }, []);

    const onAuthenticate = useCallback((password, action) => {
        return onIdTokenRevocation(authContext.user.email, password)
        .then(() => {
            if (action === "modify") {
                setReadOnly(false);
            } else if (action === "delete") {
                return onDeleteAccount();
            } else {
                toast.error(`Unknown action '${action}'`);
            }
        })
        .catch(err => {
            toast.error(err.message);
        });
    }, [toast, authContext.user.email, onIdTokenRevocation, onDeleteAccount]);

    return (
        <React.Fragment>
            <Form
                fields={fields}
                initialValues={values}
                submitAction={onSubmitUserForm}
                submitCaption={t("btn:validate")}
                readOnly={readOnly}
                onCancel={onCancelChanges}
                validationMessage={t("validationMessage")}
            />
            {
                readOnly &&
                <React.Fragment>
                    <VerticalSpacing factor={2} />
                    <Button
                        onClick={onClickModify}
                        variant="contained"
                        startIcon={<EditIcon/>}
                    >
                        {t("btn:modifyData")}
                    </Button>
                </React.Fragment>
            }
            <VerticalSpacing factor={4} />
            <Button
                color="error"
                onClick={onClickDeleteAccount}
                variant="contained"
                startIcon={<DeleteIcon/>}
                disabled={authContext.admin === true}
            >
                {t("btn:removeProfile")}
            </Button>
            <EnterPasswordDlg
                open={openPasswordDlg.open}
                action={openPasswordDlg.action}
                onValidate={onAuthenticate}
                onOpenChanged={onOpenPasswordDlgChanged}
            />
            <ConfirmDialog
                open={openDeleteConfirmation}
                onOpenChanged={setOpenDeleteConfirmation}
                onValidate={onConfirmDeleteAccount}
                title={t("title:removeProfile")}
                dialogContent={[
                    t("removeProfileContent1"),
                    t("removeProfileContent2"),
                    t("removeProfileContent3"),
                    t("removeProfileContent4")
                ]}
            />
        </React.Fragment>
    )
}

const UserProfileController = withUser(() => {
    const t = useTranslation("pages.profile");

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <VerticalSpacing factor={1} />
            <UserProfile />
         </React.Fragment>
    )
});

export default UserProfileController;