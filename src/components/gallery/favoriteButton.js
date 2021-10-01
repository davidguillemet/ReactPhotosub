import React, { useMemo, useState } from 'react';
import FavoriteIconOutlined from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import TooltipIconButton from '../tooltipIconButton';
import { useAuthContext } from '../authentication';
import { CircularProgress } from '@material-ui/core';

const FavoriteButton = ({image, fontSize = 'default', style, color }) => {

    const path = `${image.path}/${image.name}`;
    const authContext = useAuthContext();
    const [ updating, setUpdating ] = useState(false);

    // TODO: create isInfavorites() method in authContext
    const isInFavorites = useMemo(() => authContext.data && authContext.data.favorites.has(path), [authContext.data, path]);

    function handleFavoriteClick() {
        setUpdating(true);
        const favoriteActionPromise =
            isInFavorites ?
            authContext.removeUserFavorite(image) :
            authContext.addUserFavorite([image]);

        favoriteActionPromise.catch(err => {
            console.error(err);
        }).finally(() => {
            setUpdating(false);
        })
    }

    const buttonStyle = {...style};
    let title = "Ajouter aux favoris";
    if (isInFavorites) {
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
            onClick={authContext.user ? handleFavoriteClick : null}
            style={buttonStyle}
            disabled={updating}
        >
            {
                isInFavorites ?
                <FavoriteIcon fontSize={fontSize}/> :
                <FavoriteIconOutlined fontSize={fontSize} />
            }
        </TooltipIconButton>
    );
}

export default FavoriteButton;