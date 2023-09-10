import React, { useEffect } from 'react';
import { PageTitle, PageHeader, BlockQuote } from '../../template/pageTypography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from '@mui/material/Link';
import { LazyContent } from 'dialogs';

import 'fontsource-roboto/100.css';
import { useTranslation } from 'utils';

const getMenuItems = (t) => {
    const menuItems = [
        t("menuItem1"),
        t("menuItem2"),
        t("menuItem3"),
        t("menuItem4"),
        t("menuItem5"),
        t("menuItem6")
    ];
    menuItems.language = t.language;
    return menuItems;
}

const ListItemLink = (props) => {
    return <ListItem component="a" {...props} sx ={{ py: 0, color: theme => theme.palette.link.main}}/>;
}

const FinningListItem = ({caption, index}) => {
    return (
        <ListItemButton>
            <ListItemIcon sx={{ minWidth: 'unset'}}>
                <NavigateNextIcon />
            </ListItemIcon>
            <ListItemLink href={`#anchor${index}`}>
                {caption}
            </ListItemLink>
        </ListItemButton>
    );
}

const Finning = () => {
    const t = useTranslation("pages.finning");
    const [ menuItems, setMenuItems] = React.useState(() => getMenuItems(t));

    useEffect(() => {
        setMenuItems(prevItems => {
            if (prevItems.language === t.language) {
                return prevItems;
            }
            return getMenuItems(t);
        });
    }, [t])

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <PageHeader sx={{color: 'red', fontWeight: 400, textAlign: 'center'}}>{t("euroInitiative1")}<br></br>{t("euroInitiative2")}</PageHeader>
            <Link href="https://www.stop-finning.eu/" target="_blank">
            <Box sx={{ width: '100%', bgcolor: 'black', p: '20px', mb: 3}}>
                <img src="/logo-stop-finning.png" alt="Stop Finninf" style={{maxWidth: '100%'}}/>
            </Box>
            </Link>
            <Box sx={{
                width: '100%',
            }}>
                <PageHeader>{t("introduction")}</PageHeader>
                <BlockQuote sx={{
                    pl: 0
                }}>
                    <List
                        sx={{
                            py: 0,
                            textTransform: 'uppercase'
                        }}
                        dense={true}
                    >
                        {
                            menuItems.map((caption, index) => <FinningListItem key={index} caption={caption} index={index} />)
                        }
                    </List>
                </BlockQuote>

                <LazyContent path={`finning/content_${t.language}`} />

            </Box>
        </React.Fragment>
    );
};

export default Finning;