import React from 'react';
import { useLocation } from "react-router-dom";
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SocialIcons from '../../components/socialIcons';
import { useDarkMode } from 'components/theme';

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

const Footer = () => {

    const darkMode = useDarkMode();
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <StyledFooter sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1,
            mt: 'auto',
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'divider',
            backgroundColor: (theme) => isHome ? 'rgba(0,0,0,0.3)' : darkMode ? theme.palette.primary.main : theme.palette.grey[200],
            zIndex: (theme) => theme.zIndex.appBar
        }}>
            <Box sx={{ display: "flex", width: "240px" }} >
                <SocialIcons />
            </Box>
            <Copyright isHome={isHome}/>
        </StyledFooter>
    )
};

export default Footer;