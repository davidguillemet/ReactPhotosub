import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import FavoritesProvider from '../favoritesProvider';
import FavoritesContext from '../favoritesContext';
import { useAuthContext } from '../../../components/authentication';
import { useDataProvider } from '../../../components/dataProvider';
import { useQueryContext } from '../../../components/queryContext';
import { useQueryClient } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({ useQueryClient: jest.fn() }));
jest.mock('../../../components/authentication', () => ({ useAuthContext: jest.fn() }));
jest.mock('../../../components/dataProvider', () => ({ useDataProvider: jest.fn() }));
jest.mock('../../../components/queryContext', () => ({ useQueryContext: jest.fn() }));

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const mockUser = { uid: 'user-123' };

const mockImages = [
    { id: 1, name: 'a.jpg', path: '2024/test' },
    { id: 2, name: 'b.jpg', path: '2024/test' },
];

const mockUserData = {
    favorites: mockImages,
    collections: { active: 'main', items: {} },
};

const makeQueryContextMock = (overrides = {}) => {
    const mutations = {
        useAddFavorite: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
        useRemoveFavorite: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
        useSetActiveCollection: () => ({ mutateAsync: jest.fn().mockResolvedValue({ active: 'main', items: {} }) }),
        useCreateCollection: () => ({ mutateAsync: jest.fn().mockResolvedValue({ active: 'main', items: {} }) }),
        useRenameCollection: () => ({ mutateAsync: jest.fn().mockResolvedValue({ active: 'main', items: {} }) }),
        useDeleteCollection: () => ({ mutateAsync: jest.fn().mockResolvedValue({ active: 'main', items: {} }) }),
        setFavoritesData: jest.fn(),
    };
    return { ...mutations, ...overrides };
};

const makeQueryClientMock = () => ({
    getQueryData: jest.fn().mockReturnValue(null), // no cache by default
    setQueryData: jest.fn(),
});

// Renders FavoritesProvider and returns a ref that always holds the latest context value.
const renderProvider = (authUser = mockUser, overrides = {}) => {
    const contextRef = { current: null };

    const mockQueryContext = makeQueryContextMock(overrides.queryContext ?? {});
    const mockQueryClient = makeQueryClientMock();
    const mockDataProvider = {
        getUserData: jest.fn().mockResolvedValue(mockUserData),
        getFavorites: jest.fn().mockResolvedValue(mockImages),
        ...(overrides.dataProvider ?? {}),
    };

    useAuthContext.mockReturnValue({ user: authUser });
    useQueryContext.mockReturnValue(mockQueryContext);
    useQueryClient.mockReturnValue(mockQueryClient);
    useDataProvider.mockReturnValue(mockDataProvider);

    const ContextConsumer = () => {
        contextRef.current = React.useContext(FavoritesContext);
        return null;
    };

    const utils = render(
        <FavoritesProvider>
            <ContextConsumer />
        </FavoritesProvider>,
    );

    return { contextRef, ContextConsumer, mockQueryContext, mockQueryClient, mockDataProvider, ...utils };
};

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe('FavoritesProvider', () => {
    afterEach(() => jest.clearAllMocks());

    // --- Login / logout ---

    test('on login: sets activeCollectionId and viewedCollectionId from userData.collections.active', async () => {
        const userData = {
            favorites: mockImages,
            collections: { active: 'c_1', items: { 'c_1': { name: 'A', paths: [] } } },
        };
        const { contextRef } = renderProvider(mockUser, {
            dataProvider: { getUserData: jest.fn().mockResolvedValue(userData) },
        });

        await waitFor(() => {
            expect(contextRef.current.activeCollectionId).toBe('c_1');
            expect(contextRef.current.viewedCollectionId).toBe('c_1');
        });
    });

    test('on logout: resets activeCollectionId, viewedCollectionId and collections to defaults', async () => {
        const { contextRef, ContextConsumer, rerender } = renderProvider(mockUser);

        // Wait for initial login effect to settle
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        // Simulate logout
        useAuthContext.mockReturnValue({ user: null });
        rerender(
            <FavoritesProvider>
                <ContextConsumer />
            </FavoritesProvider>,
        );

        await waitFor(() => {
            expect(contextRef.current.activeCollectionId).toBe('main');
            expect(contextRef.current.viewedCollectionId).toBe('main');
            expect(contextRef.current.collections).toBeNull();
            expect(contextRef.current.mainFavoritesCount).toBe(0);
        });
    });

    // --- mainFavoritesCount / per-collection counts ---

    test('on login: sets mainFavoritesCount from userData.favorites.length', async () => {
        const { contextRef } = renderProvider();

        await waitFor(() => {
            expect(contextRef.current.mainFavoritesCount).toBe(mockImages.length);
        });
    });

    test('addUserFavorite increments mainFavoritesCount when main is active', async () => {
        const { contextRef } = renderProvider();
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        const newImage = { id: 3, name: 'c.jpg', path: '2024/test' };
        await act(async () => { await contextRef.current.addUserFavorite([newImage]); });

        expect(contextRef.current.mainFavoritesCount).toBe(mockImages.length + 1);
    });

    test('removeUserFavorite decrements mainFavoritesCount when main is active', async () => {
        const { contextRef } = renderProvider();
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        await act(async () => { await contextRef.current.removeUserFavorite(mockImages[0]); });

        expect(contextRef.current.mainFavoritesCount).toBe(mockImages.length - 1);
    });

    test('addUserFavorite appends to the active named collection\'s paths, leaving mainFavoritesCount unchanged', async () => {
        const userData = {
            favorites: mockImages,
            collections: { active: 'c_1', items: { 'c_1': { name: 'A', paths: ['2024/test/z.jpg'] } } },
        };
        const { contextRef } = renderProvider(mockUser, {
            dataProvider: { getUserData: jest.fn().mockResolvedValue(userData) },
        });
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        const newImage = { id: 3, name: 'c.jpg', path: '2024/test' };
        await act(async () => { await contextRef.current.addUserFavorite([newImage]); });

        expect(contextRef.current.collections.items['c_1'].paths).toEqual(['2024/test/z.jpg', '2024/test/c.jpg']);
        expect(contextRef.current.mainFavoritesCount).toBe(mockImages.length);
    });

    test('removeUserFavorite removes the path from the active named collection', async () => {
        const userData = {
            favorites: mockImages,
            collections: { active: 'c_1', items: { 'c_1': { name: 'A', paths: ['2024/test/z.jpg', '2024/test/y.jpg'] } } },
        };
        const { contextRef } = renderProvider(mockUser, {
            dataProvider: { getUserData: jest.fn().mockResolvedValue(userData) },
        });
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        await act(async () => {
            await contextRef.current.removeUserFavorite({ id: 99, name: 'z.jpg', path: '2024/test' });
        });

        expect(contextRef.current.collections.items['c_1'].paths).toEqual(['2024/test/y.jpg']);
    });

    // --- viewCollection ---

    test('viewCollection updates viewedCollectionId without calling any mutation', async () => {
        const { contextRef, mockQueryContext } = renderProvider();

        // Wait for login effect
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        act(() => { contextRef.current.viewCollection('c_1'); });

        expect(contextRef.current.viewedCollectionId).toBe('c_1');
        // No active mutation should have been called
        expect(mockQueryContext.useSetActiveCollection().mutateAsync).not.toHaveBeenCalled();
    });

    test('viewCollection does not change activeCollectionId', async () => {
        const { contextRef } = renderProvider();
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        act(() => { contextRef.current.viewCollection('c_1'); });

        expect(contextRef.current.activeCollectionId).toBe('main');
    });

    // --- activateCollection ---

    test('activateCollection persists to DB and updates activeCollectionId', async () => {
        const newCollections = { active: 'c_1', items: { 'c_1': { name: 'A', paths: [] } } };
        const mockMutateAsync = jest.fn().mockResolvedValue(newCollections);

        const { contextRef } = renderProvider(mockUser, {
            queryContext: {
                useSetActiveCollection: () => ({ mutateAsync: mockMutateAsync }),
            },
        });

        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        await act(async () => { await contextRef.current.activateCollection('c_1'); });

        expect(mockMutateAsync).toHaveBeenCalledWith('c_1');
        expect(contextRef.current.activeCollectionId).toBe('c_1');
        expect(contextRef.current.collections).toEqual(newCollections);
    });

    test('activateCollection does not change viewedCollectionId', async () => {
        const { contextRef } = renderProvider();
        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        // First view c_1 without activating
        act(() => { contextRef.current.viewCollection('c_1'); });
        expect(contextRef.current.viewedCollectionId).toBe('c_1');

        await act(async () => { await contextRef.current.activateCollection('c_2'); });

        // viewedCollectionId should stay c_1
        expect(contextRef.current.viewedCollectionId).toBe('c_1');
    });

    // --- Race condition ---

    test('stale activateCollection response is ignored when superseded', async () => {
        let resolveFirst, resolveSecond;
        const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
        const secondPromise = new Promise(resolve => { resolveSecond = resolve; });
        const collectionsForC1 = { active: 'c_1', items: {} };
        const collectionsForC2 = { active: 'c_2', items: {} };

        let callCount = 0;
        const mockMutateAsync = jest.fn().mockImplementation(() => {
            callCount++;
            return callCount === 1 ? firstPromise : secondPromise;
        });

        const { contextRef } = renderProvider(mockUser, {
            queryContext: {
                useSetActiveCollection: () => ({ mutateAsync: mockMutateAsync }),
            },
        });

        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        // Start two activations in quick succession
        act(() => { contextRef.current.activateCollection('c_1'); });
        act(() => { contextRef.current.activateCollection('c_2'); });

        // Resolve the first (stale) activation — should be ignored
        await act(async () => { resolveFirst(collectionsForC1); });
        expect(contextRef.current.activeCollectionId).toBe('main'); // unchanged

        // Resolve the second — should take effect
        await act(async () => { resolveSecond(collectionsForC2); });
        expect(contextRef.current.activeCollectionId).toBe('c_2');
    });

    // --- deleteCollection ---

    test('deleteCollection resets activeCollectionId to main when deleting the active collection', async () => {
        const newCollections = { active: 'c_1', items: { 'c_1': { name: 'A', paths: [] } } };
        const afterDelete = { active: 'main', items: {} };
        const mockMutateAsync = jest.fn().mockResolvedValue(afterDelete);

        const { contextRef } = renderProvider(mockUser, {
            queryContext: {
                useSetActiveCollection: () => ({
                    mutateAsync: jest.fn().mockResolvedValue(newCollections),
                }),
                useDeleteCollection: () => ({ mutateAsync: mockMutateAsync }),
            },
        });

        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        // Activate c_1 first
        await act(async () => { await contextRef.current.activateCollection('c_1'); });
        expect(contextRef.current.activeCollectionId).toBe('c_1');

        // Delete c_1 (was active)
        await act(async () => { await contextRef.current.deleteCollection('c_1'); });

        expect(contextRef.current.activeCollectionId).toBe('main');
    });

    test('deleteCollection resets viewedCollectionId to main when deleting the viewed collection', async () => {
        const afterDelete = { active: 'main', items: {} };

        const { contextRef } = renderProvider(mockUser, {
            queryContext: {
                useDeleteCollection: () => ({
                    mutateAsync: jest.fn().mockResolvedValue(afterDelete),
                }),
            },
        });

        await waitFor(() => expect(contextRef.current.collections).not.toBeNull());

        // View c_1 without activating
        act(() => { contextRef.current.viewCollection('c_1'); });
        expect(contextRef.current.viewedCollectionId).toBe('c_1');

        // Delete c_1 (was only viewed, not active)
        await act(async () => { await contextRef.current.deleteCollection('c_1'); });

        expect(contextRef.current.viewedCollectionId).toBe('main');
        expect(contextRef.current.activeCollectionId).toBe('main'); // unchanged
    });
});
