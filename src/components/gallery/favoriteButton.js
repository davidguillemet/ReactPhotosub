import React, { useState } from 'react';
import FavoriteIconOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import TooltipIconButton from '../tooltipIconButton';
import { useAuthContext } from '../authentication';
import './css/favorites.css';
import { useFavorites } from '../favorites';
import { useTranslation } from 'utils';
import { useGalleryContext } from './galleryContext';

const FavoriteButton = ({image, size = 'medium', style, color }) => {

    const t = useTranslation("components.gallery");
    const authContext = useAuthContext();
    const favoritesContext = useFavorites();
    const galleryContext = useGalleryContext();
    const [ updating, setUpdating ] = useState(false);

    const isInFavorites = React.useMemo(() => {
        const isIn = favoritesContext.isIn;
        return isIn(image);
    }, [favoritesContext, image]);

    const handleFavoriteClick = React.useCallback(() => {
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
    }, [favoritesContext, isInFavorites, image]);

    const isDisabled = galleryContext && !galleryContext.withFavorite;

    const buttonStyle = {...style};
    let title = t("btn:addFavorite");
    if (isInFavorites && updating === false) {
        title = t("btn:deleteFavorite");
        buttonStyle.color = isDisabled ? 'grey' : 'red';
    } else if (color) {
        buttonStyle.color = isDisabled ? 'grey' : color;
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
            size={size}
            disabled={isDisabled}
        >
            {
                updating ?
                <AutorenewIcon fontSize="inherit" sx={{
                    animation: 'favoriteUpdate 1.2s linear infinite' // see styles.css for favoriteUpdate
                }}/> : 
                isInFavorites ?
                <FavoriteIcon fontSize="inherit"/> :
                <FavoriteIconOutlined fontSize="inherit" />
            }
        </TooltipIconButton>
    );
}

export default FavoriteButton;