import React, { useCallback, useEffect, useState, useRef } from 'react';
import Alert from '@material-ui/core/Alert';
import { Grow, Snackbar } from '@material-ui/core';
import LoadingButton from '@material-ui/lab/LoadingButton';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import UndoIcon from '@material-ui/icons/Undo';
import { useAuthContext } from '../../components/authentication';
import Gallery from '../../components/gallery';
import { PageTitle, PageHeader } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { useGlobalContext } from '../../components/globalContext';

const MySelectionContent = ({user, images}) => {
    if (user === null) {
        return (
            <Alert severity="warning" elevation={4} variant="filled">Cette page n'est accessible qu'aux utilisateurs connectés</Alert>
        );
    }

    return (
        <React.Fragment>
        {
            images !== undefined &&
            <PageHeader>{`${images.length} Image(s)`}</PageHeader>
        }
        <Gallery images={images} style={{width: '100%'}} colWidth={300} margin={5} emptyMessage="Votre liste de favoris est vide."/>
        </React.Fragment>
    );
}

const MySelection = () => {

    const context = useGlobalContext();
    const authContext = useAuthContext();
    const { data: images } = context.useFetchFavorites(authContext.user && authContext.user.uid, true)
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
        authContext.subscribeFavorites(favoriteAction);
        return () => authContext.unsubscribeFavorites(favoriteAction);
    }, [favoriteAction, authContext])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setRemovedFavorites([]);
    };

    const handleUndo = () => {
        setUndoRunning(true);
        authContext.addUserFavorite(removedFavorites).then(() => {
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
            <VerticalSpacing factor={2} />
            <MySelectionContent user={authContext.user} images={images}></MySelectionContent>
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
}

export default MySelection;