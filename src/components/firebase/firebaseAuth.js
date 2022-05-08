import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useGlobalContext } from '../globalContext';
import './firebaseui.css';
import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
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
import { routes, NavigationLink } from '../../navigation/routes';
import { Loading } from '../hoc';

const ConnexionButtonBase = React.forwardRef(({onClick}, ref) => (
    <IconButton
        variant="contained"
        onClick={onClick}
        ref={ref}
        sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            right: 10,
            color: 'white'
        }}
        size="large">
        <AccountCircleOutlinedIcon />
    </IconButton>
))

const NotSignedInButton = ({handleSignIn}) => {

    return (
        <ConnexionButtonBase onClick={handleSignIn} />
    );
};

const SignedInButton = ({handleLogout}) => {

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
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: 20,
                    borderColor: 'white',
                    '& .MuiChip-avatar, & .MuiChip-deleteIcon, & .MuiChip-deleteIcon:hover, & .MuiChip-label': {
                        color: 'white'
                    }
                }}
            />
            <Popper open={menuOpen} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
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
                                                    <Typography variant="inherit">{route.label}</Typography>
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
                                    <Typography variant="inherit">Déconnexion</Typography>
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

const FirebaseAuth = (props) => {

    const context = useGlobalContext();
    const authContext = useAuthContext();

    const [isLogin, setIsLogin] = useState(false);

    // Listen to the Firebase Auth state and set the local state.
    useEffect(() => {
        if (authContext.user !== undefined && authContext.user !== null) {
            setIsLogin(false);
        }
    }, [authContext.user]);

    function handleSignIn(event) {
        setIsLogin(true);
    }

    function logout() {
        context.firebaseAuth.signOut();
    }

    function onCloseModal() {
        setIsLogin(false);
    }

    // Configure FirebaseUI.
    const uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            context.firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // No redirect after login
                return false;
            }
        },
    };

    return (
        <React.Fragment>
            {
                authContext.user === undefined ?
                <Loading size={20}/> :
                authContext.user === null ?
                <NotSignedInButton handleSignIn={handleSignIn} /> :
                <SignedInButton  handleLogout={logout}/>
            }

            <Modal
                open={isLogin}
                onClose={onCloseModal}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    transitionDuration: 500,
                    style: {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                }}
            >
                <Fade in={isLogin}>
                    <div style={{display: 'flex', flex: 1}}>
                        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={context.firebaseAuth} />
                    </div>
                </Fade>
            </Modal>

        </React.Fragment>
    );
}

export default FirebaseAuth;