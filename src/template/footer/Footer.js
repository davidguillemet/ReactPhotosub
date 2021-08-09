import React from 'react';
import { styled } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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

const StyledFooter = styled('footer')``;

const Footer = () => (
    <StyledFooter sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 1,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
    }}>
        <SocialMedia />
        <Copyright />
    </StyledFooter>
);

export default Footer;