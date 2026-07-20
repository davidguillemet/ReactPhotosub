import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../components/authentication';
import { useDataProvider } from '../../components/dataProvider';
import { useQueryContext } from '../../components/queryContext';
import FavoritesContext from './favoritesContext';

const imagePath = (image) => `${image.path}/${image.name}`;

const buildFavoritesMap = (images) =>
    images.reduce((acc, img) => { acc.set(imagePath(img), img); return acc; }, new Map());

const FavoritesProvider = ({ children }) => {

    const dataProvider = useDataProvider();
    const queryContext = useQueryContext();
    const authContext = useAuthContext();
    const queryClient = useQueryClient();

    const addFavoriteMutation = queryContext.useAddFavorite();
    const removeFavoriteMutation = queryContext.useRemoveFavorite();
    const setActiveMutation = queryContext.useSetActiveCollection();
    const createCollectionMutation = queryContext.useCreateCollection();
    const renameCollectionMutation = queryContext.useRenameCollection();
    const deleteCollectionMutation = queryContext.useDeleteCollection();

    const favoritesObservers = useRef([]);
    const switchTokenRef = useRef(0);

    // favorites Map always tracks the ACTIVE collection (drives isIn / FavoriteButton)
    const [favorites, setFavorites] = useState(null);
    const [activeCollectionId, setActiveCollectionId] = useState('main');
    const [viewedCollectionId, setViewedCollectionId] = useState('main');
    const [collections, setCollections] = useState(null);
    // Main collection's image count — not tracked inside `collections` (which only holds named items)
    const [mainFavoritesCount, setMainFavoritesCount] = useState(0);

    // Hydrate TanStack cache and local Map from an images array
    const applyFavorites = useCallback((images, collectionId, uid) => {
        const favMap = buildFavoritesMap(images);
        queryContext.setFavoritesData(uid, collectionId, Array.from(favMap.values()));
        setFavorites(favMap);
    }, [queryContext]);

    // Load images for a collection from cache or API, then apply. Token guards against stale switches.
    const loadCollectionImages = useCallback(async (collectionId, uid, token) => {
        let images = queryClient.getQueryData(['favorites', uid, collectionId]);
        if (!images) {
            images = await dataProvider.getFavorites(uid, collectionId);
        }
        if (token !== switchTokenRef.current) return;
        applyFavorites(images, collectionId, uid);
    }, [queryClient, dataProvider, applyFavorites]);

    // Keep the collection's tracked count (main count or named collection's paths) in sync
    // with local add/remove, so CollectionManager's per-row counts don't go stale until
    // the next full `collections` refresh (create/rename/delete/activate).
    const adjustCollectionCount = useCallback((pathsAdded, pathsRemoved) => {
        if (activeCollectionId === 'main') {
            setMainFavoritesCount(prev => Math.max(0, prev + pathsAdded.length - pathsRemoved.length));
            return;
        }
        setCollections(prevCollections => {
            const item = prevCollections?.items?.[activeCollectionId];
            if (!item) return prevCollections;
            const nextPaths = item.paths.filter(p => !pathsRemoved.includes(p)).concat(pathsAdded);
            return {
                ...prevCollections,
                items: { ...prevCollections.items, [activeCollectionId]: { ...item, paths: nextPaths } },
            };
        });
    }, [activeCollectionId]);

    const addUserFavorite = useCallback((favoriteImgArray) => {
        const pathArray = favoriteImgArray.map(img => imagePath(img));
        return addFavoriteMutation.mutateAsync({ pathArray, collectionId: activeCollectionId }).then(() => {
            setFavorites(prevFavorites => {
                const newMap = new Map(prevFavorites);
                favoriteImgArray.forEach((favoriteImg, index) => newMap.set(pathArray[index], favoriteImg));
                queryContext.setFavoritesData(authContext.user.uid, activeCollectionId, Array.from(newMap.values()));
                return newMap;
            });
            adjustCollectionCount(pathArray, []);
            favoritesObservers.current.forEach(observer => observer(favoriteImgArray, 'add'));
        });
    }, [addFavoriteMutation, queryContext, authContext.user, activeCollectionId, adjustCollectionCount]);

    const removeUserFavorite = useCallback((favoriteImg) => {
        const path = imagePath(favoriteImg);
        return removeFavoriteMutation.mutateAsync({ path, collectionId: activeCollectionId }).then(() => {
            setFavorites(prevFavorites => {
                const newMap = new Map(prevFavorites);
                newMap.delete(path);
                queryContext.setFavoritesData(authContext.user.uid, activeCollectionId, Array.from(newMap.values()));
                return newMap;
            });
            adjustCollectionCount([], [path]);
            favoritesObservers.current.forEach(observer => observer([favoriteImg], 'remove'));
        });
    }, [removeFavoriteMutation, queryContext, authContext.user, activeCollectionId, adjustCollectionCount]);

    const subscribeFavorites = useCallback((fn) => {
        favoritesObservers.current.push(fn);
    }, []);

    const unsubscribeFavorites = useCallback((fn) => {
        favoritesObservers.current = favoritesObservers.current.filter(observer => observer !== fn);
    }, []);

    const isInFavorites = useCallback((image) => {
        return (favorites && favorites.has(imagePath(image)));
    }, [favorites]);

    // View a collection: update the gallery display (no DB write, TanStack Query fetches on demand)
    const viewCollection = useCallback((id) => {
        setViewedCollectionId(id);
    }, []);

    // Set a collection as active: persist to DB, update favorites Map for isIn
    const activateCollection = useCallback(async (id) => {
        const uid = authContext.user?.uid;
        if (!uid) return;

        const token = ++switchTokenRef.current;
        setFavorites(null);

        const updatedCollections = await setActiveMutation.mutateAsync(id);
        if (token !== switchTokenRef.current) return;

        setActiveCollectionId(id);
        setCollections(updatedCollections);
        await loadCollectionImages(id, uid, token);
    }, [authContext.user, setActiveMutation, loadCollectionImages]);

    const createCollection = useCallback(async (name) => {
        const updatedCollections = await createCollectionMutation.mutateAsync({ name });
        setCollections(updatedCollections);
        return updatedCollections;
    }, [createCollectionMutation]);

    const renameCollection = useCallback(async (id, name) => {
        const updatedCollections = await renameCollectionMutation.mutateAsync({ id, name });
        setCollections(updatedCollections);
        return updatedCollections;
    }, [renameCollectionMutation]);

    const deleteCollection = useCallback(async (id) => {
        const uid = authContext.user?.uid;
        const wasActive = id === activeCollectionId;
        const wasViewed = id === viewedCollectionId;
        const updatedCollections = await deleteCollectionMutation.mutateAsync(id);
        setCollections(updatedCollections);
        if (wasActive) {
            const token = ++switchTokenRef.current;
            setFavorites(null);
            setActiveCollectionId('main');
            await loadCollectionImages('main', uid, token);
        }
        if (wasViewed) {
            setViewedCollectionId('main');
        }
        return updatedCollections;
    }, [deleteCollectionMutation, activeCollectionId, viewedCollectionId, authContext.user, loadCollectionImages]);

    useEffect(() => {
        if (authContext.user) {
            dataProvider.getUserData().then((userData) => {
                const uid = authContext.user.uid;
                const userCollections = userData.collections || { active: 'main', items: {} };
                const activeId = userCollections.active || 'main';

                setCollections(userCollections);
                setActiveCollectionId(activeId);
                setViewedCollectionId(activeId);
                setMainFavoritesCount(userData.favorites?.length ?? 0);

                if (activeId === 'main') {
                    applyFavorites(userData.favorites, 'main', uid);
                } else {
                    const token = ++switchTokenRef.current;
                    setFavorites(null);
                    loadCollectionImages(activeId, uid, token);
                }
            });
        } else {
            setFavorites(null);
            setActiveCollectionId('main');
            setViewedCollectionId('main');
            setCollections(null);
            setMainFavoritesCount(0);
        }
    }, [authContext.user]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <FavoritesContext.Provider value={{
            isIn: isInFavorites,
            addUserFavorite,
            removeUserFavorite,
            subscribeFavorites,
            unsubscribeFavorites,
            activeCollectionId,
            viewedCollectionId,
            collections,
            mainFavoritesCount,
            viewCollection,
            activateCollection,
            createCollection,
            renameCollection,
            deleteCollection,
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export default FavoritesProvider;
