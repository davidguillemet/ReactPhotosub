import React from 'react';
import FavoriteIconOutlined from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import dataProvider from '../../dataProvider';

import TooltipIconButton from '../tooltipIconButton';
import { AuthContext } from '../authentication';

const FavoriteButton = ({user, isInFavorites, updateUserFavorites, fontSize = 'default', style, color, path }) => {

    function handleFavoriteClick() {
        const updatePromise =
            isInFavorites ?
            dataProvider.removeFavorite :
            dataProvider.addFavorite;

        updatePromise(path).then(favorites => {
            updateUserFavorites(favorites);
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
                        user === null &&
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
            onClick={user ? handleFavoriteClick : null}
            style={buttonStyle}
        >
            {
                isInFavorites ?
                <FavoriteIcon fontSize={fontSize}/> :
                <FavoriteIconOutlined fontSize={fontSize} />
            }
        </TooltipIconButton>
    );
}

const FavoriteButtonConsumer = (props) => {
    return (
        <AuthContext.Consumer>
            { ({user, data, updateUserFavorites}) => {
                return (
                    <FavoriteButton
                        user={user}
                        isInFavorites={data && data.favorites.has(props.path)}
                        updateUserFavorites={updateUserFavorites}
                        {...props} />
                );
            }}
        </AuthContext.Consumer>
    );
}

export default FavoriteButtonConsumer;