import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@material-ui/icons/FavoriteBorderOutlined';
import Zoom from '@material-ui/core/Zoom';

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

    if (!authContext.user) {
        return (
            <Tooltip title="Ajouter aux favoris (connexion requise)" placement="top" TransitionComponent={Zoom} arrow classes={{
                tooltip: classes.tooltipLabel,
                tooltipPlacementTop: classes.tooltipPlacementTop
            }}>
                <IconButton style={style}>
                    <FavoriteIcon fontSize={fontSize}/>
                </IconButton>
            </Tooltip>
        );
    }

    return (
        <Tooltip title="Ajouter aux favoris" placement="top" TransitionComponent={Zoom} arrow classes={{
            tooltip: classes.tooltipLabel,
            tooltipPlacementTop: classes.tooltipPlacementTop
        }}>
            <IconButton style={style} onClick={handleFavoriteClick}>
                <FavoriteIcon fontSize={fontSize}/>
            </IconButton>
        </Tooltip>
    );
}

export default FavoriteButton;