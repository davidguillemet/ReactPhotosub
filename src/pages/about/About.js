import React from 'react';
import Box from '@mui/material/Box';
import { PageTitle } from '../../template/pageTypography';
import { LazyContent } from 'dialogs';
import { useTranslation } from 'utils';

const About = () => {
    const t = useTranslation("pages.about");
    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <Box sx={{
                width: '100%',
                my: 2
            }}>
                <img src="/dgui1.jpg" alt="David Guillemet" style={{width: '100%'}}></img>
            </Box>
            <LazyContent path={`about/content_${t.language}`} />
        </React.Fragment>
    )
}

export default About;