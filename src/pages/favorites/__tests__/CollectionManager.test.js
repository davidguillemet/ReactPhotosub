import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import CollectionManager from '../CollectionManager';
import CollectionForm from '../CollectionForm';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';

jest.mock('providers', () => ({ useFavorites: jest.fn() }));
jest.mock('utils', () => ({ useTranslation: jest.fn() }));

// Mock FormDialog: FormDialog always renders its children (no open gate) so that
// CollectionForm is rendered on every render and we can inspect its props via mock.calls.
// dialogProps is kept empty ({}) so the spread in CollectionManager does not pollute children.
jest.mock('dialogs/FormDialog', () => {
    const React = require('react');
    function AlwaysOpenDialog({ children }) {
        return React.createElement(React.Fragment, null, children);
    }
    return {
        __esModule: true,
        default: function useFormDialog() {
            const [, setOpen] = React.useState(false);
            return {
                dialogProps: {},
                openDialog: function() { setOpen(true); },
                FormDialog: AlwaysOpenDialog,
            };
        },
    };
});

// Mock CollectionForm to isolate CollectionManager logic
jest.mock('../CollectionForm', () => ({
    __esModule: true,
    default: jest.fn(({ collection }) => (
        <div data-testid="collection-form" data-collection-id={collection?.id ?? 'new'} />
    )),
}));

// -----------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------

const mockCollections = {
    active: 'main',
    items: {
        'c_1': { name: 'Red Sea', paths: ['a/b.jpg'] },
        'c_2': { name: 'Mediterranean', paths: [] },
    },
};

const createMockT = (lang = 'en') => {
    const t = (key, args) => {
        if (args == null) return key;
        const arr = Array.isArray(args) ? args : [args];
        return arr.reduce((s, a, i) => s.replace(`{${i}}`, a), key);
    };
    t.language = lang;
    return t;
};

const createMockContext = (overrides = {}) => ({
    activeCollectionId: 'main',
    viewedCollectionId: 'main',
    collections: mockCollections,
    mainFavoritesCount: 5,
    viewCollection: jest.fn(),
    activateCollection: jest.fn().mockResolvedValue({}),
    deleteCollection: jest.fn().mockResolvedValue({}),
    ...overrides,
});

// Returns the table row that contains the given text, using only Testing Library queries.
const getRowByText = (text) =>
    screen.getAllByRole('row').find(row => within(row).queryByText(text));

// Returns the action button within a row by its accessible name (the mock t() passthrough
// key, e.g. 'btn:edit'), rather than a brittle positional index.
const getActionButton = (row, name) => within(row).getByRole('button', { name });

// The set-active button is wrapped in an extra <span> (required by MUI Tooltip on a
// disabled button), so its aria-label lands on that <span>, not the <button> — name-based
// queries can't find it. It's always the first action button, regardless of what other
// buttons a row has, so a positional lookup is safe here.
const getSetActiveButton = (row) => within(row).getAllByRole('button')[0];

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe('CollectionManager', () => {
    let mockContext;

    beforeEach(() => {
        mockContext = createMockContext();
        useFavorites.mockReturnValue(mockContext);
        useTranslation.mockReturnValue(createMockT());
    });

    afterEach(() => jest.clearAllMocks());

    const renderCM = (props = {}) => render(<CollectionManager {...props} />);

    // --- Rendering ---

    test('renders header title spanning all columns', () => {
        renderCM();
        expect(screen.getByRole('columnheader')).toHaveTextContent('title');
    });

    test('renders the "other user" title with the username when a username is provided', () => {
        const t = jest.fn(createMockT());
        useTranslation.mockReturnValue(Object.assign(t, { language: 'en' }));
        renderCM({ username: 'David' });
        expect(t).toHaveBeenCalledWith('title:other', 'David');
        expect(screen.queryByText('title')).not.toBeInTheDocument();
    });

    test('renders one row per collection plus header and new-collection row', () => {
        renderCM();
        // header(1) + main(1) + c_1(1) + c_2(1) + new-collection(1) = 5
        expect(screen.getAllByRole('row')).toHaveLength(5);
    });

    test('renders collection names', () => {
        renderCM();
        expect(screen.getByText('main')).toBeInTheDocument();
        expect(screen.getByText('Red Sea')).toBeInTheDocument();
        expect(screen.getByText('Mediterranean')).toBeInTheDocument();
    });

    test('renders per-collection image counts, including main', () => {
        renderCM();
        expect(within(getRowByText('main')).getByText('5')).toBeInTheDocument();
        expect(within(getRowByText('Red Sea')).getByText('1')).toBeInTheDocument();
        expect(within(getRowByText('Mediterranean')).getByText('0')).toBeInTheDocument();
    });

    // --- Button counts per row ---

    test('main collection row has two action buttons (set-active, copy) and set-active is disabled', () => {
        renderCM();
        const mainRow = getRowByText('main');
        const buttons = within(mainRow).getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(buttons[0]).toBeDisabled();
    });

    test('named collection row has four action buttons: set-active, edit, copy, delete', () => {
        renderCM();
        const c1Row = getRowByText('Red Sea');
        expect(within(c1Row).getAllByRole('button')).toHaveLength(4);
    });

    // --- View interaction ---

    test('clicking a collection row calls viewCollection with its id', () => {
        renderCM();
        fireEvent.click(getRowByText('Red Sea'));
        expect(mockContext.viewCollection).toHaveBeenCalledWith('c_1');
    });

    test('clicking an action button does not call viewCollection (stopPropagation)', async () => {
        renderCM();
        const setActiveBtn = getSetActiveButton(getRowByText('Red Sea'));
        fireEvent.click(setActiveBtn);
        expect(mockContext.viewCollection).not.toHaveBeenCalled();
        // Wait for the `finally` state update in handleSetActive to settle so it's
        // captured by act(), avoiding an "update not wrapped in act(...)" warning.
        await waitFor(() => {
            expect(setActiveBtn).not.toBeDisabled();
        });
    });

    // --- Set active ---

    test('clicking set-active button calls activateCollection with the collection id', async () => {
        renderCM();
        const setActiveBtn = getSetActiveButton(getRowByText('Red Sea'));
        fireEvent.click(setActiveBtn);
        expect(mockContext.activateCollection).toHaveBeenCalledWith('c_1');
        // Wait for the `finally` state update in handleSetActive to settle so it's
        // captured by act(), avoiding an "update not wrapped in act(...)" warning.
        await waitFor(() => {
            expect(setActiveBtn).not.toBeDisabled();
        });
    });

    test('all other buttons are disabled while activateCollection is pending', async () => {
        let resolveActivation;
        mockContext.activateCollection.mockImplementation(
            () => new Promise(resolve => { resolveActivation = resolve; }),
        );
        renderCM();

        fireEvent.click(getSetActiveButton(getRowByText('Red Sea')));

        await waitFor(() => {
            within(getRowByText('Mediterranean'))
                .getAllByRole('button')
                .forEach(btn => expect(btn).toBeDisabled());
        });

        act(() => { resolveActivation({}); });
        await waitFor(() => {
            expect(getSetActiveButton(getRowByText('Red Sea'))).not.toBeDisabled();
        });
    });

    // --- Delete flow ---

    test('clicking delete button opens the confirm dialog', () => {
        renderCM();
        const deleteBtn = getActionButton(getRowByText('Red Sea'), 'btn:delete');
        fireEvent.click(deleteBtn);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('confirming delete calls deleteCollection with the collection id', async () => {
        renderCM();
        fireEvent.click(getActionButton(getRowByText('Red Sea'), 'btn:delete'));

        // ConfirmDialog renders t("validate") → "validate" (passthrough mock)
        fireEvent.click(within(screen.getByRole('dialog')).getByText('validate'));

        await waitFor(() => {
            expect(mockContext.deleteCollection).toHaveBeenCalledWith('c_1');
        });
    });

    // --- Create / edit dialog ---
    // AlwaysOpenDialog renders CollectionForm unconditionally; we verify the `collection`
    // prop by inspecting CollectionForm.mock.lastCall after each state-changing click.

    test('clicking edit button pre-fills form with the collection data', async () => {
        renderCM();
        CollectionForm.mockClear();
        fireEvent.click(getActionButton(getRowByText('Red Sea'), 'btn:edit'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({ collection: expect.objectContaining({ id: 'c_1' }) }),
                expect.anything(),
            );
        });
    });

    test('clicking new-collection row resets form to create mode (collection=null)', async () => {
        renderCM();
        // First open edit mode so formTarget is not null
        fireEvent.click(getActionButton(getRowByText('Red Sea'), 'btn:edit'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({ collection: expect.objectContaining({ id: 'c_1' }) }),
                expect.anything(),
            );
        });
        // Click new-collection to reset formTarget to null
        CollectionForm.mockClear();
        fireEvent.click(getRowByText('btn:new'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({ collection: null }),
                expect.anything(),
            );
        });
    });

    test('clicking copy button opens the form with copyFrom set to the source collection', async () => {
        renderCM();
        CollectionForm.mockClear();
        fireEvent.click(getActionButton(getRowByText('Red Sea'), 'btn:copy'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    collection: null,
                    copyFrom: { id: 'c_1', name: 'Red Sea' },
                }),
                expect.anything(),
            );
        });
    });

    test('clicking copy on the main row opens the form with copyFrom set to main', async () => {
        renderCM();
        CollectionForm.mockClear();
        fireEvent.click(getActionButton(getRowByText('main'), 'btn:copy'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    collection: null,
                    copyFrom: { id: 'main', name: 'main' },
                }),
                expect.anything(),
            );
        });
    });

    test('clicking edit after copy resets copyFrom to null', async () => {
        renderCM();
        fireEvent.click(getActionButton(getRowByText('Red Sea'), 'btn:copy'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({ copyFrom: expect.objectContaining({ id: 'c_1' }) }),
                expect.anything(),
            );
        });

        CollectionForm.mockClear();
        fireEvent.click(getActionButton(getRowByText('Mediterranean'), 'btn:edit'));
        await waitFor(() => {
            expect(CollectionForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    collection: expect.objectContaining({ id: 'c_2' }),
                    copyFrom: null,
                }),
                expect.anything(),
            );
        });
    });

    // --- readOnly mode ---

    describe('readOnly mode', () => {
        let mockOnView;

        beforeEach(() => {
            mockOnView = jest.fn();
        });

        const renderReadOnly = () => renderCM({
            collections: {
                active: 'main',
                items: { 'c_1': { name: 'Red Sea', paths: [] } },
                mainCount: 7,
            },
            viewedCollectionId: 'main',
            onView: mockOnView,
            readOnly: true,
        });

        test('does not render any action buttons', () => {
            renderReadOnly();
            expect(screen.queryAllByRole('button')).toHaveLength(0);
        });

        test('does not render the new-collection row', () => {
            renderReadOnly();
            expect(screen.queryByText('btn:new')).not.toBeInTheDocument();
        });

        test('clicking a collection row calls onView with its id', () => {
            renderReadOnly();
            fireEvent.click(getRowByText('Red Sea'));
            expect(mockOnView).toHaveBeenCalledWith('c_1');
        });

        test('clicking a collection row does not call viewCollection', () => {
            renderReadOnly();
            fireEvent.click(getRowByText('Red Sea'));
            expect(mockContext.viewCollection).not.toHaveBeenCalled();
        });

        test('renders main count from collections.mainCount, not the own context', () => {
            renderReadOnly();
            expect(within(getRowByText('main')).getByText('7')).toBeInTheDocument();
        });
    });
});
