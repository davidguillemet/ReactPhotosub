import React from 'react';
import { useCurrentPage } from 'components/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SocialIcons from '../../components/socialIcons';

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

    const { isHomePage } = useCurrentPage();

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
            ...(isHomePage && {
                backgroundColor: 'rgba(0,0,0,0.3)'
            }),
            zIndex: (theme) => theme.zIndex.appBar
        }}>
            <Box sx={{ display: "flex", width: "240px" }} >
                <SocialIcons />
            </Box>
            <Copyright isHome={isHomePage}/>
        </StyledFooter>
    )
};

export default Footer;