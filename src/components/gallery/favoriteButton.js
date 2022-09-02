import React, { useState } from 'react';
import FavoriteIconOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import TooltipIconButton from '../tooltipIconButton';
import { useAuthContext } from '../authentication';
import './styles.css';
import { useFavorites } from '../favorites';

const FavoriteButton = ({image, fontSize = 'default', style, color }) => {

    const authContext = useAuthContext();
    const favoritesContext = useFavorites();
    const [ updating, setUpdating ] = useState(false);

    const isInFavorites = favoritesContext.isIn(image);

    function handleFavoriteClick() {
        setUpdating(true);
        const favoriteActionPromise =
            isInFavorites ?
            favoritesContext.removeUserFavorite(image) :
            favoritesContext.addUserFavorite([image]);

        favoriteActionPromise.catch(err => {
            // Empty... mutationCache is adding an error toast
        }).finally(() => {
            setUpdating(false);
        })
    }

    const buttonStyle = {...style};
    let title = "Ajouter aux favoris";
    if (isInFavorites && updating === false) {
        title = 'Retirer des favoris';
        buttonStyle.color = 'red';
    } else if (color) {
        buttonStyle.color = color;
    }

    return (
        <TooltipIconButton
            tooltip={
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
            onClick={authContext.user && updating === false ? handleFavoriteClick : null}
            style={buttonStyle}
            disabled={updating}
        >
            {
                updating ?
                <AutorenewIcon fontSize={fontSize} sx={{
                    animation: 'favoriteUpdate 1.2s linear infinite' // see styles.css for favoriteUpdate
                }}/> : 
                isInFavorites ?
                <FavoriteIcon fontSize={fontSize}/> :
                <FavoriteIconOutlined fontSize={fontSize} />
            }
        </TooltipIconButton>
    );
}

export default FavoriteButton;