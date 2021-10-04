import React, { useMemo, useState } from 'react';
import FavoriteIconOutlined from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import TooltipIconButton from '../tooltipIconButton';
import { useAuthContext } from '../authentication';
import './styles.css';

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