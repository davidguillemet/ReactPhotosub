import React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { withRouter } from "react-router";

function SocialMedia() {
    return (null);
}

const Copyright = ({isHome}) => {
    return (
        <Typography
            variant="body"
            sx={{
                color: (theme) => isHome ? '#ccc' : theme.palette.text.secondary,
                fontWeight: '400'
            }}
        >
            {'Copyright © David Guillemet '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const StyledFooter = styled('footer')``;

const Footer = withRouter(({location}) => {

    const isHome = location.pathname === '/';

    return (
        <StyledFooter sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1,
            mt: 'auto',
            backgroundColor: (theme) => isHome ? 'rgba(0,0,0,0.3)' : theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
            zIndex: (theme) => theme.zIndex.appBar
        }}>
            <SocialMedia />
            <Copyright isHome={isHome}/>
        </StyledFooter>
    )
});

export default Footer;