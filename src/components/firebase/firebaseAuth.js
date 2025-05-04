import useFirebaseContext from './firebaseContextHook';
import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useAuthContext } from '../authentication';
import { routes, NavigationLink, ROUTES_NAMESPACE } from '../../navigation/routes';
import { Loading } from '../hoc';
import { useTranslation } from '../../utils';
import useFormDialog from 'dialogs/FormDialog';
import AuthenticationForm from './authenticationForm';

const ConnexionButtonBase = React.forwardRef(({onClick}, ref) => (
    <IconButton
        onClick={onClick}
        ref={ref}
        sx={{
            color: theme => theme.palette.text.primary
        }}
        size="large"
    >
        <AccountCircleOutlinedIcon />
    </IconButton>
))

const NotSignedInButton = ({handleSignIn}) => {

    return (
        <ConnexionButtonBase onClick={handleSignIn} />
    );
};

const LoadingUserState = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Loading size={24} sx={{mt: 0, color: 'white'}}/>
        </Box>
    )
}

const SignedInButton = ({handleLogout}) => {

    const t = useTranslation(ROUTES_NAMESPACE);
    const authContext = useAuthContext();
    const [userDisplayName, setUserDisplayName] = React.useState(authContext.user.displayName);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const onUserUpdated = useCallback(() => {
        setUserDisplayName(authContext.user.displayName);
    }, [authContext.user]);

    useEffect(() => {
        const unregisterUserObserver = authContext.registerUserObserver(onUserUpdated);
        return () => unregisterUserObserver();
    }, [onUserUpdated, authContext]);

    const handleToggle = () => {
        setMenuOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
          return;
        }
        setMenuOpen(false);
    };

    const logout = (event) => {
        handleClose(event);
        handleLogout();
    }

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
          event.preventDefault();
          setMenuOpen(false);
        }
    }
    
    return (
        <React.Fragment>

            <Chip
                ref={anchorRef}
                variant="outlined"
                avatar={<AccountCircleOutlinedIcon />}
                label={userDisplayName}
                onClick={handleToggle}
                deleteIcon={<MoreVertIcon />}
                onDelete={handleToggle}
                sx={{
                    borderColor: theme => theme.palette.text.primary,
                    '& .MuiChip-avatar, & .MuiChip-deleteIcon, & .MuiChip-deleteIcon:hover, & .MuiChip-label': {
                        color: theme => theme.palette.text.primary
                    }
                }}
            />
            <Popper
                open={menuOpen}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                placement={'bottom'}
                modifiers={[
                    {
                        name: 'preventOverflow',
                        enabled: true,
                        options: {
                            altAxis: false,
                            altBoundary: false,
                            tether: false,
                            rootBoundary: 'document',
                            padding: 8,
                        },
                    }
                ]}
            >
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList autoFocusItem={menuOpen} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                {
                                    routes.filter(route => route.private).map((route, index) => {
                                        return (
                                            <NavigationLink key={index} to={route.path}>
                                                <MenuItem onClick={handleClose}>
                                                    <ListItemIcon>
                                                        {route.icon}
                                                    </ListItemIcon>
                                                    <Typography variant="inherit">{t(route.label)}</Typography>
                                                </MenuItem>
                                            </NavigationLink>
                                        );
                                    })
                                }
                                <Divider />
                                <MenuItem onClick={logout}>
                                    <ListItemIcon>
                                        <ExitToAppIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography variant="inherit">{t("logout")}</Typography>
                                </MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
            </Popper>
        </React.Fragment>
    );
}

const FirebaseAuth = ({onLoginStateChange}) => {

    const t = useTranslation("components.form::authentication");
    const firebaseContext = useFirebaseContext();
    const authContext = useAuthContext();

    const [isLogin, setIsLogin] = useState(false);
    const { dialogProps, openDialog, FormDialog } = useFormDialog();

    // Listen to the Firebase Auth state and set the local state.
    useEffect(() => {
        if (authContext.user !== undefined && authContext.user !== null) {
            setIsLogin(false);
        }
    }, [authContext.user]);

    useEffect(() => {
        if (onLoginStateChange) {
            onLoginStateChange(isLogin);
        }
    }, [isLogin, onLoginStateChange]);

    const onCancelLogin = () => {};

    function handleSignIn(event) {
        openDialog();
    }

    function logout() {
        firebaseContext.signOut();
    }

    return (
        <React.Fragment>
            {
                authContext.user === undefined ?
                <LoadingUserState /> :
                authContext.user === null ?
                <NotSignedInButton handleSignIn={handleSignIn} /> :
                <SignedInButton handleLogout={logout}/>
            }

            <FormDialog title={t("title")} maxWidth='sm' {...dialogProps}>
                <AuthenticationForm onCancel={onCancelLogin} />
            </FormDialog>

        </React.Fragment>
    );
}

export default FirebaseAuth;