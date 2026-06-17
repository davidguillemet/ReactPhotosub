import React from 'react';
import FavoriteIconOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

import { useAuthContext } from '../authentication';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';
import { useGalleryContext } from './galleryContext';
import ToggleActionButton from 'components/toggleActionButton';

const FavoriteButton = ({ image, size = 'medium', style, color }) => {

    const t = useTranslation("components.gallery");
    const authContext = useAuthContext();
    const favoritesContext = useFavorites();
    const galleryContext = useGalleryContext();

    const isInFavorites = React.useMemo(() => {
        return favoritesContext.isIn(image);
    }, [favoritesContext, image]);

    const handleAction = React.useCallback(() => {
        return isInFavorites ?
            favoritesContext.removeUserFavorite(image) :
            favoritesContext.addUserFavorite([image]);
    }, [favoritesContext, isInFavorites, image]);

    const isDisabled = galleryContext && !galleryContext.withFavorite;

    const loginWarning = authContext.user === null ? (
        <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '5px 0 0 0' }}>
            <ErrorOutlineIcon style={{ marginRight: 5 }} color="warning" />
            <Typography variant="caption">Connexion requise</Typography>
        </Box>
    ) : null;

    return (
        <ToggleActionButton
            isActive={isInFavorites}
            isDisabled={isDisabled}
            canInteract={!!authContext.user}
            title={isInFavorites ? t("btn:deleteFavorite") : t("btn:addFavorite")}
            onAction={handleAction}
            activeIcon={<FavoriteIcon fontSize="inherit" />}
            inactiveIcon={<FavoriteIconOutlined fontSize="inherit" />}
            size={size}
            style={style}
            color={color}
            tooltipExtra={loginWarning}
        />
    );
};

export default FavoriteButton;
