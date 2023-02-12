import React from 'react';
import { Box } from '@mui/system';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab'; 
import { useTranslation } from '../utils';
import { PageTitle } from '../template/pageTypography';
import { VerticalSpacing } from '../template/spacing';
import { withUser } from '../components/hoc';
import Regions from './regions/Regions';
import Images from './images';

const tabs = [
    {
        label: "regions",
        component: Regions
    },
    {
        label: "images",
        component: Images
    },
];

const Admin = () => {

    const t = useTranslation("pages.admin");
    const [currentTab, setCurrentTab] = React.useState(0);
    const handleChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const Component = tabs[currentTab].component;
    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <VerticalSpacing factor={2} />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleChange} >
                {
                    tabs.map((tab, index) => {
                        return <Tab key={index} label={t(tab.label)} />
                    })
                }
                </Tabs>
            </Box>
            <VerticalSpacing factor={2} />
            <Component />
        </React.Fragment>
    );
}

export default withUser(Admin, { admin: true, alert: true});