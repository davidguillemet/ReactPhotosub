import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import FirebaseApp from './firebaseApp';
import './firebaseui.css';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuList from '@material-ui/core/MenuList';
import { NavLink } from 'react-router-dom';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { AuthContext } from '../authentication';

const useStyles = makeStyles((theme) => ({
    link: {
        textDecoration: 'none',
        color: theme.palette.text.primary
    }
}));

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

const ConnexionButtonBase = React.forwardRef(({onClick}, ref) => (
    <IconButton
        variant="contained"
        onClick={onClick}
        ref={ref}
        style={{
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

    const classes = useStyles();

    const [menuOpen, setMenuOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setMenuOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        console.log("handleClose")
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
                avatar={<AccountCircleOutlinedIcon />}
                label={user.displayName}
                onClick={handleToggle}
                deleteIcon={<MoreVertIcon />}
                onDelete={handleToggle}
                style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: 20
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
                                <NavLink to="/my_selection" className={classes.link}>
                                    <MenuItem onClick={handleClose}>
                                        <ListItemIcon>
                                            <FavoriteIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="inherit">Mes favoris</Typography>
                                    </MenuItem>
                                </NavLink>
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