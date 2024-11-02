import React, { useLayoutEffect } from 'react';
import { Box } from '@mui/system';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab'; 
import { useTranslation, useQueryParameter } from 'utils';
import { PageTitle } from 'template/pageTypography';
import { VerticalSpacing } from 'template/spacing';
import { withUser } from 'components/hoc';
import Regions from './regions/Regions';
import Images from './images';
import NotFound from 'pages/notFound';
import { useHistory, useLocation } from 'react-router-dom';

const _tabs = [
    {
        id: "regions",
        label: "lbl:regions",
        component: Regions
    },
    {
        id: "images",
        label: "lbl:images",
        component: Images
    },
];

const _defaultTab = 0;

const Admin = () => {

    const getQueryParameter = useQueryParameter();
    const history = useHistory();
    const location = useLocation();
    const t = useTranslation("pages.admin");
    const [tabIndex, setTabIndex] = React.useState(_defaultTab);
    const handleChange = (event, newValue) => {
        history.push({
            pathname: location.pathname,
            search: `?tab=${_tabs[newValue].id}`
        });
    };

    useLayoutEffect(() => {
        const tabParameter = getQueryParameter("tab");
        if (tabParameter) {
            const queryTabIndex = _tabs.findIndex(tab => tab.id === tabParameter);
            setTabIndex(queryTabIndex);
        }
    }, [getQueryParameter]);

    if (tabIndex === -1) {
        return <NotFound />;
    }

    const Component = _tabs[tabIndex].component;

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <VerticalSpacing factor={2} />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    textColor="secondary"
                    indicatorColor="secondary"
                >
                {
                    _tabs.map((tab, index) => {
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