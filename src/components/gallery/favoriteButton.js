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
import dataProvider from '../../dataProvider';

import { AuthContext } from '../authentication';

const useFavoriteStyles = makeStyles(theme => ({
    tooltipLabel: {
        fontSize: 16
    },
    tooltipPlacementTop: {
        backgroundColor: 'black',
        top: 15
    }
}));

const FavoriteButton = ({user, isInFavorites, updateUserContext, fontSize = 'default', style, color, path }) => {
    const classes = useFavoriteStyles();

    function handleFavoriteClick() {
        const updatePromise =
            isInFavorites ?
            dataProvider.removeFavorite :
            dataProvider.addFavorite;

        updatePromise(path).then(favorites => {
            updateUserContext(user, favorites);
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
        <Tooltip
            title={
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
            placement="top"
            TransitionComponent={Zoom}
            arrow
            classes={{
                tooltip: classes.tooltipLabel,
                tooltipPlacementTop: classes.tooltipPlacementTop
            }}
        >
            <IconButton style={buttonStyle} onClick={user ? handleFavoriteClick : null}>
                {
                    isInFavorites ?
                    <FavoriteIcon fontSize={fontSize}/> :
                    <FavoriteIconOutlined fontSize={fontSize} />
                }
            </IconButton>
        </Tooltip>
    );
}

const FavoriteButtonConsumer = (props) => {
    return (
        <AuthContext.Consumer>
            { ({user, data, updateUserContext}) => {
                return (
                    <FavoriteButton
                        user={user}
                        isInFavorites={data && data.favorites.has(props.path)}
                        updateUserContext={updateUserContext}
                        {...props} />
                );
            }}
        </AuthContext.Consumer>
    );
}

export default FavoriteButtonConsumer;