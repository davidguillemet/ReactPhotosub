import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useGlobalContext } from '../globalContext';
import './firebaseui.css';
import React, { useEffect, useState } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { useAuthContext } from '../authentication';
import { routes, NavigationLink } from '../../navigation/routes';

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
    >
        <AccountCircleOutlinedIcon />
    </IconButton>
))

const NotSignedInButton = ({handleSignIn}) => {

    return (
        <ConnexionButtonBase onClick={handleSignIn} />
    );
};

const SignedInButton = ({user, handleLogout}) => {

    const [menuOpen, setMenuOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

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
                label={user.displayName}
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
        const unregisterAuthObserver = context.firebase.auth().onAuthStateChanged(newUser => {
            setIsLogin(false);
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, [context.firebase]);

    function handleSignIn(event) {
        setIsLogin(true);
    }

    function logout() {
        context.firebase.auth().signOut();
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
                authContext.user === null ?
                <NotSignedInButton handleSignIn={handleSignIn} /> :
                <SignedInButton user={authContext.user} handleLogout={logout}/>
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
                        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={context.firebase.auth()} />
                    </div>
                </Fade>
            </Modal>

        </React.Fragment>
    );
}

export default FirebaseAuth;