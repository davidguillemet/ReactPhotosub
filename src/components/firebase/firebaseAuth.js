import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
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

const config = {
    apiKey: "AIzaSyALeWHQ-CKzvcG-sb7466UNzFDn_w5HQOc",
    authDomain: "photosub.firebaseapp.com",
    projectId: "photosub",
    storageBucket: "photosub.appspot.com",
    messagingSenderId: "780806748384",
    appId: "1:780806748384:web:c2976014be05cc21a13885",
    measurementId: "G-NNE3P3R7HH"
};
firebase.initializeApp(config);

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to home after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

const NotSignedInButton = ({handleSignIn}) => {

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={handleSignIn}
            startIcon={<AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon>}
            style={{
                position: 'absolute',
                top: 10,
                right: 10
            }}
        >
            Connexion
        </Button>
    );
};

const SignedInButton = ({user, handleLogout}) => {

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
          return;
        }
        setOpen(false);
    };

    const logout = (event) => {
        handleClose(event);
        handleLogout();
    }

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
          event.preventDefault();
          setOpen(false);
        }
    }
    
    return (
        <React.Fragment>
            <Button
                ref={anchorRef}
                variant="contained"
                color="secondary"
                onClick={handleToggle}
                startIcon={<AccountCircleOutlinedIcon fontSize='large'></AccountCircleOutlinedIcon>}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10
                }}
            >
                {user.displayName}
            </Button>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                    <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
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

const FirebaseAuth = (props) => {

    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);


    // Listen to the Firebase Auth state and set the local state.
    useEffect(() => {
        const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
            setUser(user);
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, []);

    function handleSignIn(event) {
        setIsLogin(true);
    }

    function logout() {
        firebase.auth().signOut();
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
                    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                </Fade>
            </Modal>

        </React.Fragment>
    );
}

export default FirebaseAuth;