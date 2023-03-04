import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Grow, Snackbar } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import { useAuthContext } from '../../components/authentication';
import Gallery from '../../components/gallery';
import { PageTitle, PageSubTitle } from '../../template/pageTypography';
import { useQueryContext } from '../../components/queryContext';
import { withLoading, buildLoadingState, withUser } from '../../components/hoc';
import { useFavorites } from '../../components/favorites';

const MySelectionContent = withLoading(({images}) => {
    return (
        <React.Fragment>
        {
            images !== undefined &&
            <PageSubTitle sx={{mt: 0}}>{`${images.length} Image(s)`}</PageSubTitle>
        }
        <Gallery images={images} groupBy="year" emptyMessage="Votre liste de favoris est vide."/>
        </React.Fragment>
    );
}, [ buildLoadingState("images", [null, undefined]) ]);

const MySelection = withUser(() => {

    const queryContext = useQueryContext();
    const authContext = useAuthContext();
    const favoritesContext = useFavorites();
    const { data: images } = queryContext.useFetchFavorites(authContext.user && authContext.user.uid, true)
    const [ removedFavorites, setRemovedFavorites ] = useState([]);
    const [ undoRunning, setUndoRunning ] = useState(false);
    const undoTimerRef = useRef(null);

    const favoriteAction = useCallback((images, action) => {
        switch (action) {
            case 'remove':
                setRemovedFavorites(prevRemoved => [...prevRemoved, ...images ]);
                break;
            case 'add':
                // filter prevRemoved to remove all items from images
                setRemovedFavorites(prevRemoved => prevRemoved.filter(prevImg => images.findIndex(img => img.id === prevImg.id) === -1))
                break;
            default:
                throw new Error(`Unknown favorite action '${action}'`)
        }
    }, []);

    useEffect(() => {
        if (removedFavorites.length > 0) {
            // reinit the interval
            if (undoTimerRef.current !== null) {
                clearTimeout(undoTimerRef.current);
            }
            // Clear removed favorites in 5s
            undoTimerRef.current = setTimeout(() => { setRemovedFavorites([]); }, 5000);
        }
        return () => clearTimeout(undoTimerRef.current)
    }, [removedFavorites])

    useEffect(() => {
        favoritesContext.subscribeFavorites(favoriteAction);
        return () => favoritesContext.unsubscribeFavorites(favoriteAction);
    }, [favoriteAction, favoritesContext])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setRemovedFavorites([]);
    };

    const handleUndo = () => {
        setUndoRunning(true);
        favoritesContext.addUserFavorite(removedFavorites).then(() => {
            setRemovedFavorites([]);
        }).finally(() => {
            setUndoRunning(false);
        })
    }

    const undoAction = (
        <React.Fragment>
            <LoadingButton
                size="small"
                onClick={handleUndo}
                loading={undoRunning}
                endIcon={<UndoIcon />}
                loadingPosition="end"
                variant="contained"
            >
                ANNULER
            </LoadingButton>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
            >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <PageTitle>Ma Sélection</PageTitle>
            <MySelectionContent images={images}></MySelectionContent>
            {
                removedFavorites.length > 0 && 
                <Snackbar
                    open={true}
                    message={`${removedFavorites.length} favori(s) supprimé(s)`}
                    action={undoAction}
                    TransitionComponent={Grow}
                />
            }

        </React.Fragment>
    );
});

export default MySelection;