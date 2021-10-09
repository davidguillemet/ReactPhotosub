import React, { useCallback, useEffect, useState, useRef, useMemo} from 'react';
import Alert from '@material-ui/core/Alert';
import { Grow, Snackbar, Stack } from '@material-ui/core';
import LoadingButton from '@material-ui/lab/LoadingButton';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import UndoIcon from '@material-ui/icons/Undo';
import { useAuthContext } from '../../components/authentication';
import Gallery from '../../components/gallery';
import { PageTitle, PageSubTitle, BlockQuote } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { useGlobalContext } from '../../components/globalContext';
import { withLoading, buildLoadingState } from '../../components/loading';
import { grey } from '@material-ui/core/colors';

const getImageProps = (image) => {
    // image path is "<year>/<name>"
    const props = image.path.split('/');
    return {
        year: props[0],
        name: props[1]
    };
}

const groupFavoritesByYear = (images) => {
    const imagesByYear = new Map();
    images.forEach((image) => {
        const imageProps = getImageProps(image);
        let yearImages = imagesByYear.get(imageProps.year);
        if (yearImages === undefined) {
            yearImages = [];
            imagesByYear.set(imageProps.year, yearImages);
        }
        yearImages.push(image);
        // Sort by date
        yearImages.sort((img1, img2) => { return img2.create > img1.create ? 1 : -1; });
    });
    return imagesByYear;
}

const MySelectionContent = withLoading(({images}) => {
    const favoritesByYear = useMemo(() => groupFavoritesByYear(images), [images]);

    return (
        <React.Fragment>
        {
            images !== undefined &&
            <PageSubTitle sx={{mt: 0}}>{`${images.length} Image(s)`}</PageSubTitle>
        }
        {
            Array.from(favoritesByYear.keys()).sort((year1, year2) => { return year2 > year1 ? 1 : -1; }).map((year) => {
                const images = favoritesByYear.get(year);
                return (
                    <Stack sx={{width: '100%'}} key={year}>
                        <BlockQuote sx={{mb: 1, mt: 3, ml: 0, pl: 1, bgcolor: grey[200]}}>{year}</BlockQuote>
                        <Gallery images={images} emptyMessage="Votre liste de favoris est vide."/>
                    </Stack>
                )
            })
        }
        </React.Fragment>
    );
}, [ buildLoadingState("images", [null, undefined]) ]);

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
            <VerticalSpacing factor={1} />
            {
                authContext.user === null ?
                <Alert severity="warning" elevation={4} variant="filled">Cette page n'est accessible qu'aux utilisateurs connectés</Alert> :
                <MySelectionContent images={images}></MySelectionContent>
            }
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