
import React from 'react';
import { Stack } from '@mui/material';
import Form, { FIELD_TYPE_SELECT } from 'components/form';
import { useQueryContext } from 'components/queryContext';
import { useAuthContext } from 'components/authentication';
import { withUser } from 'components/hoc';
import { Paragraph } from 'template/pageTypography';

const UserSelection = withUser(({onChange}) => {
    const queryContext = useQueryContext();
    const authContext = useAuthContext();
    const [ fields, setFields ] = React.useState([]);
    const [ value, setValue ] = React.useState(authContext.user.uid);

    const getCaption = React.useCallback((user) => {
        let caption = user.displayName;
        if (user.uid === authContext.user.uid) {
            caption += " (vous)";
        };
        return caption;
    }, [authContext]);

    const getUsers = React.useCallback(() => {
        const { data, isError, error } = queryContext.useFetchUsers();
        if (isError === true) {
            throw error;
        }
        return [...data];
    }, [queryContext]);

    const onUserChanged = React.useCallback((field, value) => {
        setValue(value);
        if (onChange) {
            onChange(value);
        }
    }, [onChange]);

    React.useEffect(() => {
        setFields([
            {
                id: "user",
                label: "Sélection d'un utilisateur",
                required: true,
                errorText: "Merci de sélectionner un utilisateur.",
                type: FIELD_TYPE_SELECT,
                options: getUsers,
                mapping: {
                    "value": "uid",
                    "caption": "displayName",
                    "key": "uid"
                },
                getCaption: getCaption,
                default: "",
                focus: true
            }
        ]);
    }, [getUsers, authContext, getCaption]);

    return (
        <Stack>
            <Paragraph>Pour voir la sélection d'un autre utilisateur:</Paragraph>
            <Form
                fields={fields}
                onChange={onUserChanged}
                initialValues={{
                    user: value
                }}
            />
        </Stack>
    )
}, { alert: false, admin: true });



export default UserSelection;