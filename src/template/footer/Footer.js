import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useFooterStyles = makeStyles((theme) => ({
    footer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(1),
        marginTop: 'auto',
        backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
    }    
}));

function SocialMedia() {
    return (null);
}

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary">
            {'Copyright © David Guillemet '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const Footer = () => {
    const classes = useFooterStyles();

    return (
        <footer className={classes.footer}>
            <SocialMedia />
            <Copyright />
        </footer>
    );
}

export default Footer;