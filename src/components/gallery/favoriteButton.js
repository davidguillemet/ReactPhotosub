import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/FavoriteBorderOutlined';
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

const FavoriteButton = ({fontSize = 'default', style }) => {
    const classes = useFavoriteStyles();
    const authContext = useAuthContext();

    function handleFavoriteClick() {
        // La requête doit contenir le heaer 'Authorization: Bearer ID_TOKEN'
        console.log("add favorite");
    }

    return (
        <Tooltip
            title={
                <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography variant="body1">Ajouter aux favoris</Typography>
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
            <IconButton style={style} onClick={authContext.user ? handleFavoriteClick : null}>
                <FavoriteIcon fontSize={fontSize}/>
            </IconButton>
        </Tooltip>
    );
}

export default FavoriteButton;