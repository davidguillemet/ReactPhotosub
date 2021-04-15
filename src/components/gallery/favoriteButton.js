import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIconOutlined from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Zoom from '@material-ui/core/Zoom';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import { useAuthContext } from '../authentication';

const useFavoriteStyles = makeStyles(theme => ({
    tooltipLabel: {
        fontSize: 16
    },
    tooltipPlacementTop: {
        backgroundColor: 'black',
        top: 15
    }
}));

const FavoriteButton = ({fontSize = 'default', style, color, path }) => {
    const classes = useFavoriteStyles();
    const authContext = useAuthContext();

    function handleFavoriteClick() {
        // La requête doit contenir le heaer 'Authorization: Bearer ID_TOKEN'
        console.log("add favorite");
    }

    const isInFavorites = authContext.user && authContext.data.favorites.has(path);
    const buttonStyle = {...style};
    let title = "Ajouter aux favoris";
    if (isInFavorites) {
        title = 'Retirer des favoris';
        buttonStyle.color = 'red';
    } else if (color) {
        buttonStyle.color = color;
    }

    return (
        <Tooltip
            title={
                <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography variant="body1">{title}</Typography>
                    {
                        authContext.user === null &&
                        <Box style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <ErrorOutlineIcon style={{marginRight: 5}}></ErrorOutlineIcon>
                            <Typography variant="caption">Connexion requise</Typography>
                        </Box>
                    }        
                </Box>
            }
            placement="top"
            TransitionComponent={Zoom}
            arrow
            classes={{
                tooltip: classes.tooltipLabel,
                tooltipPlacementTop: classes.tooltipPlacementTop
            }}
        >
            <IconButton style={buttonStyle} onClick={authContext.user ? handleFavoriteClick : null}>
                {
                    isInFavorites ?
                    <FavoriteIcon fontSize={fontSize}/> :
                    <FavoriteIconOutlined fontSize={fontSize} />
                }
            </IconButton>
        </Tooltip>
    );
}

export default FavoriteButton;