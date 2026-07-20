import React, { useCallback, useEffect, useState } from 'react';
import { Grow, Snackbar } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { useAuthContext } from 'components/authentication';
import Gallery from 'components/gallery';
import { PageTitle, PageSubTitle } from 'template/pageTypography';
import { useQueryContext } from 'components/queryContext';
import { withLoading, buildLoadingState, withUser } from 'components/hoc';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';
import GroupBuilder from './groupBuilder';
import UserSelection from './userSelection';
import CollectionManager from './CollectionManager';
import { VerticalSpacing } from 'template/spacing';
import TooltipIconButton from 'components/tooltipIconButton';


const MySelectionContent = withLoading(({images, uid, collectionName}) => {
    const t = useTranslation("pages.favorites");
    const authContext = useAuthContext();

    const emptyMessage = t("info:emptyCollection", collectionName);

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
    const tCol = useTranslation("pages.favorites.collections");
    const queryContext = useQueryContext();
    const authContext = useAuthContext();
    const favoritesContext = useFavorites();
    const [ removedFavorites, setRemovedFavorites ] = useState([]);
    const [ undoRunning, setUndoRunning ] = useState(false);
    const [ favoritesUserUid, setFavoritesUserUid ] = useState(authContext.user && authContext.user.uid);

    const isOwnSelection = favoritesUserUid === authContext.user.uid;
    const { viewedCollectionId, collections } = favoritesContext;
    const lang = t.language;

    const [ adminViewedCollectionId, setAdminViewedCollectionId ] = useState('main');

    const { data: otherUserCollections } = queryContext.useFetchUserCollections(favoritesUserUid, !isOwnSelection);
    const { data: users } = queryContext.useFetchUsers();

    const otherUsername = React.useMemo(() => {
        if (isOwnSelection) return null;
        return users?.find(user => user.uid === favoritesUserUid)?.displayName ?? null;
    }, [isOwnSelection, users, favoritesUserUid]);

    const collectionId = isOwnSelection ? viewedCollectionId : adminViewedCollectionId;

    const collectionName = React.useMemo(() => {
        const id = isOwnSelection ? viewedCollectionId : adminViewedCollectionId;
        if (id === 'main') return tCol("main");
        const source = isOwnSelection ? collections : otherUserCollections;
        const item = source?.items?.[id];
        return item ? (lang === 'fr' ? item.name_fr : item.name_en) : tCol("main");
    }, [isOwnSelection, viewedCollectionId, adminViewedCollectionId, collections, otherUserCollections, lang, tCol]);

    const { data: images } = queryContext.useFetchFavorites(favoritesUserUid, collectionId, true);

    useEffect(() => {
        setFavoritesUserUid(authContext.user.uid);
        setAdminViewedCollectionId('main');
    }, [authContext.user]);

    // Clear undo state when viewing a different collection
    useEffect(() => {
        setRemovedFavorites([]);
    }, [viewedCollectionId, adminViewedCollectionId]);

    const favoriteAction = useCallback((images, action) => {
        switch (action) {
            case 'remove':
                setRemovedFavorites(prevRemoved => [...prevRemoved, ...images ]);
                break;
            case 'add':
                setRemovedFavorites(prevRemoved => prevRemoved.filter(prevImg => images.findIndex(img => img.id === prevImg.id) === -1));
                break;
            default:
                throw new Error(`Unknown favorite action '${action}'`);
        }
    }, []);

    const onUserChange = useCallback((newUserUid) => {
        setFavoritesUserUid(newUserUid);
        setAdminViewedCollectionId('main');
    }, []);

    useEffect(() => {
        favoritesContext.subscribeFavorites(favoriteAction);
        return () => favoritesContext.unsubscribeFavorites(favoriteAction);
    }, [favoriteAction, favoritesContext]);

    const handleUndo = () => {
        setUndoRunning(true);
        favoritesContext.addUserFavorite(removedFavorites).then(() => {
            setRemovedFavorites([]);
        }).finally(() => {
            setUndoRunning(false);
        });
    };

    const undoAction = (
        <React.Fragment>
            <TooltipIconButton
                tooltip={t("btn:cancelDeletion")}
                size="small"
                onClick={handleUndo}
                loading={undoRunning}
                loadingPosition="end"
            >
                <UndoIcon size="small" />
            </TooltipIconButton>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <UserSelection onChange={onUserChange} />
            {isOwnSelection
                ? <CollectionManager />
                : otherUserCollections && <CollectionManager
                    collections={otherUserCollections}
                    viewedCollectionId={adminViewedCollectionId}
                    onView={setAdminViewedCollectionId}
                    readOnly
                    username={otherUsername}
                  />
            }
            <VerticalSpacing factor={4}/>
            <MySelectionContent images={images} uid={favoritesUserUid} collectionName={collectionName} />
            <Snackbar
                open={removedFavorites.length > 0}
                message={t("info:favoritesDeleted", removedFavorites.length)}
                action={undoAction}
                slots={{
                    transition: Grow
                }}
            />
        </React.Fragment>
    );
});

export default MySelection;

export const Component = MySelection;
