import React, { useEffect } from 'react';
import { useNavigate } from "react-router";
import { PageTitle, PageHeader, BlockQuote } from '../../template/pageTypography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
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

const FinningListItem = ({caption, index}) => {

    const navigate = useNavigate();
    const href = React.useMemo(() => `#section${index}`, [index]);

    const onClickItem = React.useCallback(() => {
        navigate({
            hash: href
        });
    }, [href, navigate]);

    return (
        <ListItem disablePadding>
            <ListItemButton
                onClick={onClickItem}
                sx={{
                    py: '2px'
                }}
            >
                <ListItemIcon sx={{ minWidth: 'unset'}}>
                    <NavigateNextIcon />
                </ListItemIcon>
                <ListItemText
                    primary={caption}
                    slotProps={{
                        primary: {
                            sx: {
                                fontSize: '1.1rem !important'
                            }
                        }
                    }}
                />
            </ListItemButton>
        </ListItem>
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
            <PageHeader
                sx={{
                    color: theme => theme.palette.error.main,
                    fontWeight: 400,
                    textAlign: 'center'
                }}
            >
                {t("euroInitiative1")}<br></br>{t("euroInitiative2")}
            </PageHeader>
            <Link href="https://www.stop-finning.eu/" target="_blank">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        p: '20px',
                        mb: 3
                    }}
                >
                    <img src="/logo-stop-finning.png" alt="Stop Finninf" style={{maxWidth: '100%'}}/>
                </Box>
            </Link>
            <Box sx={{
                width: '100%',
            }}>
                <PageHeader >{t("introduction")}</PageHeader>
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

export const Component = Finning;
