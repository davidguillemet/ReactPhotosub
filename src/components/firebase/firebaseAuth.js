import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import FirebaseApp from './firebaseApp';
import './firebaseui.css';
import React, { useEffect, useState } from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import MenuItem from '@material-ui/core/MenuItem';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';

import { AuthContext } from '../authentication';

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        FirebaseApp.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // No redirect after login
            return false;
        }
    },
};

const ConnexionButtonBase = React.forwardRef(({startIcon, onClick, children}, ref) => (
    <Button
        variant="contained"
        color="primary"
        onClick={onClick}
        startIcon={startIcon}
        ref={ref}
        style={{
            position: 'absolute',
            right: 10,
            bottom: 10
        }}
    >
        {children}
    </Button>
))

const NotSignedInButton = ({handleSignIn}) => {

    return (
        <ConnexionButtonBase
            onClick={handleSignIn}
            startIcon={<AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon>}
        >
            Connexion
        </ConnexionButtonBase>
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
            <ConnexionButtonBase
                ref={anchorRef}
                onClick={handleToggle}
                startIcon={<AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon>}
            >
                {user.displayName}
            </ConnexionButtonBase>
            <Popper open={menuOpen} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList autoFocusItem={menuOpen} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                <MenuItem onClick={logout}>Deconnexion</MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
      </React.Fragment>
    );
}

const FirebaseAuth = ({ user }) => {

    const [isLogin, setIsLogin] = useState(false);

    // Listen to the Firebase Auth state and set the local state.
    useEffect(() => {
        const unregisterAuthObserver = FirebaseApp.auth().onAuthStateChanged(newUser => {
            setIsLogin(false);
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, []);

    function handleSignIn(event) {
        setIsLogin(true);
    }

    function logout() {
        FirebaseApp.auth().signOut();
    }

    function onCloseModal() {
        setIsLogin(false);
    }

    return (
        <React.Fragment>
            {
                user === null ?
                <NotSignedInButton handleSignIn={handleSignIn} /> :
                <SignedInButton user={user} handleLogout={logout}/>
            }

            <Modal
                open={isLogin}
                onClose={onCloseModal}
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    style: {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                }}
            >
                <Fade in={isLogin}>
                    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={FirebaseApp.auth()} />
                </Fade>
            </Modal>

        </React.Fragment>
    );
}

const FirebaseAuthConsumer = () => {
    return (
        <AuthContext.Consumer>
            { ({user}) => {
                return (
                    <FirebaseAuth user={user} />
                );
            }}
        </AuthContext.Consumer>
    );
}

export default FirebaseAuthConsumer;