import React, { useCallback, useEffect, useState } from 'react';
import { Grow, Snackbar } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import { useAuthContext } from '../../components/authentication';
import Gallery from '../../components/gallery';
import { PageTitle, PageSubTitle } from '../../template/pageTypography';
import { useQueryContext } from '../../components/queryContext';
import { withLoading, buildLoadingState, withUser } from '../../components/hoc';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';
import GroupBuilder from './groupBuilder';
import UserSelection from './userSelection';
import { VerticalSpacing } from 'template/spacing';
import TooltipIconButton from 'components/tooltipIconButton';


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
        favoritesContext.subscribeFavorites(favoriteAction);
        return () => favoritesContext.unsubscribeFavorites(favoriteAction);
    }, [favoriteAction, favoritesContext])

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
            <TooltipIconButton
                tooltip={t("btn:cancelDeletion")}
                size="small"
                onClick={handleUndo}
                loading={undoRunning}
                loadingPosition="end"
            >
                <UndoIcon size="small" />
                {/* {t("btn:cancelDeletion")} */}
            </TooltipIconButton>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <UserSelection onChange={onUserChange} />
            <VerticalSpacing factor={4}/>
            <MySelectionContent images={images} uid={favoritesUserUid}></MySelectionContent>
            <Snackbar
                open={removedFavorites.length > 0 }
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
