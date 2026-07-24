import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Users from '../Users';
import { useQueryContext } from 'components/queryContext';
import { useToast } from 'components/notifications';
import { useTranslation } from 'utils';

jest.mock('components/queryContext', () => ({ useQueryContext: jest.fn() }));
jest.mock('components/notifications', () => ({ useToast: jest.fn() }));
jest.mock('utils', () => ({ useTranslation: jest.fn() }));

// components/hoc's barrel also re-exports withUser, which transitively pulls in the whole
// app (router, firebase, dataProvider/axios) — irrelevant here and not Jest-parseable as-is.
// Mock it with a minimal reimplementation of the withLoading/buildLoadingState logic we rely on.
jest.mock('components/hoc', () => {
    const React = require('react');
    return {
        withLoading: (Component, conditions) => function LoadingWrapper(props) {
            const ready = conditions.every(({ property, value }) => {
                const sentinels = Array.isArray(value) ? value : [value];
                return sentinels.every((v) => props[property] !== v);
            });
            if (!ready) {
                return React.createElement('div', { 'data-testid': 'loading' });
            }
            return React.createElement(Component, props);
        },
        buildLoadingState: (property, value) => ({ property, value }),
    };
});

// -----------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------

// A normal user: present in both Firebase and user_data, with favorites and a collection.
const okUser = {
    uid: 'u_ok',
    email: 'alice@test.com',
    displayName: 'Alice',
    disabled: false,
    hasFirebaseAccount: true,
    hasUserData: true,
    hasFavorites: true,
    hasCollections: true,
};

// Orphaned in user_data: no matching Firebase account — deletable. No favorites/collections.
const orphanUser = {
    uid: 'u_orphan',
    email: null,
    displayName: null,
    disabled: null,
    hasFirebaseAccount: false,
    hasUserData: true,
    hasFavorites: false,
    hasCollections: false,
};

// Firebase-only: no user_data row — not deletable (nothing in Postgres to remove).
const firebaseOnlyUser = {
    uid: 'u_fb_only',
    email: 'bob@test.com',
    displayName: 'Bob',
    disabled: false,
    hasFirebaseAccount: true,
    hasUserData: false,
    hasFavorites: null,
    hasCollections: null,
};

const mockUsers = [okUser, orphanUser, firebaseOnlyUser];

const createMockT = () => {
    const t = (key, args) => {
        if (args == null) return key;
        const arr = Array.isArray(args) ? args : [args];
        return arr.reduce((s, a, i) => s.replace(`{${i}}`, a), key);
    };
    t.language = 'en';
    return t;
};

const createMockQueryContext = (overrides = {}) => ({
    useFetchManagedUsers: () => ({ data: mockUsers, isError: false }),
    useDeleteManagedUsers: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
    ...overrides,
});

const getRowByText = (text) =>
    screen.getAllByRole('row').find(row => within(row).queryByText(text));

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe('Users (admin)', () => {
    let mockToast;

    beforeEach(() => {
        mockToast = { success: jest.fn(), error: jest.fn() };
        useQueryContext.mockReturnValue(createMockQueryContext());
        useToast.mockReturnValue({ toast: mockToast });
        useTranslation.mockReturnValue(createMockT());
    });

    afterEach(() => jest.clearAllMocks());

    const renderUsers = () => render(<Users />);

    // --- Loading state ---

    test('renders nothing but a loading indicator while data is undefined', () => {
        useQueryContext.mockReturnValue(createMockQueryContext({
            useFetchManagedUsers: () => ({ data: undefined, isError: false }),
        }));
        renderUsers();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    // --- Rendering ---

    test('renders one row per user plus the header row', () => {
        renderUsers();
        expect(screen.getAllByRole('row')).toHaveLength(mockUsers.length + 1);
    });

    test('renders email, display name and a checkmark for favorites/collections when the user has both', () => {
        renderUsers();
        const row = getRowByText('alice@test.com');
        const cells = within(row).getAllByRole('cell');
        expect(within(row).getByText('Alice')).toBeInTheDocument();
        expect(within(cells[2]).getByTestId('CheckCircleOutlinedIcon')).toBeInTheDocument();
        expect(within(cells[3]).getByTestId('CheckCircleOutlinedIcon')).toBeInTheDocument();
    });

    test('falls back to the uid, shows a placeholder display name, and no checkmarks when the user has neither', () => {
        renderUsers();
        const row = getRowByText('u_orphan');
        const cells = within(row).getAllByRole('cell');
        expect(within(row).getByText('—')).toBeInTheDocument(); // displayName placeholder
        expect(within(cells[2]).queryByTestId('CheckCircleOutlinedIcon')).not.toBeInTheDocument();
        expect(within(cells[3]).queryByTestId('CheckCircleOutlinedIcon')).not.toBeInTheDocument();
    });

    test('shows placeholders for favorites/collections when there is no user_data row', () => {
        renderUsers();
        const row = getRowByText('bob@test.com');
        const cells = within(row).getAllByRole('cell');
        expect(cells[2]).toHaveTextContent('—');
        expect(cells[3]).toHaveTextContent('—');
    });

    // --- Anomaly indicator ---

    test('does not show a status indicator for a normal user', () => {
        renderUsers();
        const row = getRowByText('alice@test.com');
        expect(within(row).queryByLabelText('status:noFirebaseAccount')).not.toBeInTheDocument();
        expect(within(row).queryByLabelText('status:noUserData')).not.toBeInTheDocument();
    });

    test('shows the "no Firebase account" indicator for an orphaned user_data row', () => {
        renderUsers();
        const row = getRowByText('u_orphan');
        expect(within(row).getByLabelText('status:noFirebaseAccount')).toBeInTheDocument();
    });

    test('shows the "no user data" indicator for a Firebase-only user', () => {
        renderUsers();
        const row = getRowByText('bob@test.com');
        expect(within(row).getByLabelText('status:noUserData')).toBeInTheDocument();
    });

    // --- Delete action visibility ---

    test('does not show a delete button for a normal user', () => {
        renderUsers();
        const row = getRowByText('alice@test.com');
        expect(within(row).queryAllByRole('button')).toHaveLength(0);
    });

    test('does not show a delete button for a Firebase-only user', () => {
        renderUsers();
        const row = getRowByText('bob@test.com');
        expect(within(row).queryAllByRole('button')).toHaveLength(0);
    });

    test('shows a delete button only for an orphaned user_data row', () => {
        renderUsers();
        const row = getRowByText('u_orphan');
        expect(within(row).getAllByRole('button')).toHaveLength(1);
    });

    // --- Delete flow ---

    test('clicking delete opens the confirm dialog', () => {
        renderUsers();
        fireEvent.click(within(getRowByText('u_orphan')).getByRole('button'));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('confirming delete calls the mutation with the orphaned uid and toasts success', async () => {
        const mockMutateAsync = jest.fn().mockResolvedValue({});
        useQueryContext.mockReturnValue(createMockQueryContext({
            useDeleteManagedUsers: () => ({ mutateAsync: mockMutateAsync }),
        }));
        renderUsers();

        fireEvent.click(within(getRowByText('u_orphan')).getByRole('button'));
        // ConfirmDialog renders t("validate") → "validate" (passthrough mock)
        fireEvent.click(within(screen.getByRole('dialog')).getByText('validate'));

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith(['u_orphan']);
        });
        await waitFor(() => {
            expect(mockToast.success).toHaveBeenCalledWith('success:deleted');
        });
    });

    test('toasts an error message when the delete mutation rejects', async () => {
        const mockMutateAsync = jest.fn().mockRejectedValue(new Error('boom'));
        useQueryContext.mockReturnValue(createMockQueryContext({
            useDeleteManagedUsers: () => ({ mutateAsync: mockMutateAsync }),
        }));
        renderUsers();

        fireEvent.click(within(getRowByText('u_orphan')).getByRole('button'));
        fireEvent.click(within(screen.getByRole('dialog')).getByText('validate'));

        await waitFor(() => {
            expect(mockToast.error).toHaveBeenCalledWith('error:delete');
        });
    });

    test('cancelling the confirm dialog does not call the mutation', async () => {
        const mockMutateAsync = jest.fn();
        useQueryContext.mockReturnValue(createMockQueryContext({
            useDeleteManagedUsers: () => ({ mutateAsync: mockMutateAsync }),
        }));
        renderUsers();

        fireEvent.click(within(getRowByText('u_orphan')).getByRole('button'));
        fireEvent.click(within(screen.getByRole('dialog')).getByText('cancel'));

        // MUI Dialog exits with a transition, so removal from the DOM isn't synchronous.
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    // --- Purge orphans ---

    test('the purge button is disabled when there are no orphaned users', () => {
        useQueryContext.mockReturnValue(createMockQueryContext({
            useFetchManagedUsers: () => ({ data: [okUser, firebaseOnlyUser], isError: false }),
        }));
        renderUsers();
        expect(screen.getByRole('button', { name: 'btn:purgeOrphans' })).toBeDisabled();
    });

    test('the purge button is enabled when at least one user is orphaned', () => {
        renderUsers();
        expect(screen.getByRole('button', { name: 'btn:purgeOrphans' })).not.toBeDisabled();
    });

    test('clicking purge opens the confirm dialog with the plural message when there are 2+ orphans', () => {
        useQueryContext.mockReturnValue(createMockQueryContext({
            useFetchManagedUsers: () => ({
                data: [okUser, orphanUser, { ...orphanUser, uid: 'u_orphan_2' }, firebaseOnlyUser],
                isError: false,
            }),
        }));
        renderUsers();
        fireEvent.click(screen.getByRole('button', { name: 'btn:purgeOrphans' }));
        expect(within(screen.getByRole('dialog')).getByText('confirm:purge')).toBeInTheDocument();
    });

    test('clicking purge opens the confirm dialog with the singular message when there is exactly 1 orphan', () => {
        renderUsers();
        fireEvent.click(screen.getByRole('button', { name: 'btn:purgeOrphans' }));
        expect(within(screen.getByRole('dialog')).getByText('confirm:delete')).toBeInTheDocument();
    });

    test('confirming purge calls the mutation with every orphaned uid and toasts the plural success message', async () => {
        const mockMutateAsync = jest.fn().mockResolvedValue({});
        const secondOrphan = { ...orphanUser, uid: 'u_orphan_2' };
        useQueryContext.mockReturnValue(createMockQueryContext({
            useFetchManagedUsers: () => ({
                data: [okUser, orphanUser, secondOrphan, firebaseOnlyUser],
                isError: false,
            }),
            useDeleteManagedUsers: () => ({ mutateAsync: mockMutateAsync }),
        }));
        renderUsers();

        fireEvent.click(screen.getByRole('button', { name: 'btn:purgeOrphans' }));
        fireEvent.click(within(screen.getByRole('dialog')).getByText('validate'));

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith(['u_orphan', 'u_orphan_2']);
        });
        await waitFor(() => {
            expect(mockToast.success).toHaveBeenCalledWith('success:purged');
        });
    });

    test('cancelling the purge confirm dialog does not call the mutation', async () => {
        const mockMutateAsync = jest.fn();
        useQueryContext.mockReturnValue(createMockQueryContext({
            useDeleteManagedUsers: () => ({ mutateAsync: mockMutateAsync }),
        }));
        renderUsers();

        fireEvent.click(screen.getByRole('button', { name: 'btn:purgeOrphans' }));
        fireEvent.click(within(screen.getByRole('dialog')).getByText('cancel'));

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });
});
