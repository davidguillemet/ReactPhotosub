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
import { useTranslation } from 'utils';
import GroupBuilder from './groupBuilder';
import UserSelection from './userSelection';
import { VerticalSpacing } from 'template/spacing';

const MySelectionContent = withLoading(({images, uid}) => {
    const t = useTranslation("pages.favorites");
    const authContext = useAuthContext();

    const emptyMessage =
        uid === authContext.user.uid ?
        t("info:noFavorites") : 
        t("info:userHasNoFavorites");

    return (
        <React.Fragment>
        {
            images !== undefined &&
            <PageSubTitle sx={{mt: 0}}>{t("favoritesCount", images.length)}</PageSubTitle>
        }
        <Gallery
            images={images}
            groupBuilder={GroupBuilder}
            emptyMessage={emptyMessage}
            withFavorite={uid === authContext.user.uid}
        />
        </React.Fragment>
    );
}, [ buildLoadingState("images", [null, undefined]) ]);

const MySelection = withUser(() => {

    const t = useTranslation("pages.favorites");
    const queryContext = useQueryContext();
    const authContext = useAuthContext();
    const favoritesContext = useFavorites();
    const [ removedFavorites, setRemovedFavorites ] = useState([]);
    const [ undoRunning, setUndoRunning ] = useState(false);
    const undoTimerRef = useRef(null);
    const [ favoritesUserUid, setFavoritesUserUid ] = useState(authContext.user && authContext.user.uid);

    const { data: images } = queryContext.useFetchFavorites(favoritesUserUid, true);

    useEffect(() => {
        setFavoritesUserUid(authContext.user.uid);
    }, [authContext.user])

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

    const onUserChange = useCallback((newUserUid) => {
        setFavoritesUserUid(newUserUid);
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
            >
                {t("btn:cancelDeletion")}
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
            <PageTitle>{t("title")}</PageTitle>
            <UserSelection onChange={onUserChange} />
            <VerticalSpacing factor={4}/>
            <MySelectionContent images={images} uid={favoritesUserUid}></MySelectionContent>
            {
                removedFavorites.length > 0 && 
                <Snackbar
                    open={true}
                    message={t("info:favoritesDeleted", removedFavorites.length)}
                    action={undoAction}
                    TransitionComponent={Grow}
                />
            }

        </React.Fragment>
    );
});

export default MySelection;