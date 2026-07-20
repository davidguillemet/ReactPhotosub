import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollectionForm from '../CollectionForm';
import { useFavorites } from 'providers';
import { useTranslation } from 'utils';

jest.mock('providers', () => ({ useFavorites: jest.fn() }));
jest.mock('utils', () => ({ useTranslation: jest.fn() }));

// Mock Form to capture the props passed to it and expose a submit trigger
jest.mock('components/form', () => ({
    __esModule: true,
    default: ({ initialValues, submitCaption, submitAction, onCancel }) => (
        <div data-testid="form">
            <span data-testid="submit-caption">{submitCaption}</span>
            <span data-testid="initial-values">{JSON.stringify(initialValues)}</span>
            <button
                data-testid="submit-btn"
                onClick={() => submitAction({ name_fr: 'Test FR', name_en: 'Test EN' })}
            >
                submit
            </button>
            <button data-testid="cancel-btn" onClick={onCancel}>cancel</button>
        </div>
    ),
    FIELD_TYPE_TEXT: 'text',
}));

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const createMockT = (lang = 'en') => {
    const t = (key) => key;
    t.language = lang;
    return t;
};

const mockCollection = { id: 'c_1', name_fr: 'Mer Rouge', name_en: 'Red Sea' };

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe('CollectionForm', () => {
    let mockCreateCollection;
    let mockRenameCollection;
    let mockOnCancel;

    beforeEach(() => {
        mockCreateCollection = jest.fn().mockResolvedValue({});
        mockRenameCollection = jest.fn().mockResolvedValue({});
        mockOnCancel = jest.fn();

        useFavorites.mockReturnValue({
            createCollection: mockCreateCollection,
            renameCollection: mockRenameCollection,
        });

        useTranslation.mockReturnValue(createMockT());
    });

    afterEach(() => jest.clearAllMocks());

    // --- Create mode (collection = null) ---

    describe('create mode', () => {
        const renderCreate = () =>
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);

        test('passes null as initialValues to Form', () => {
            renderCreate();
            expect(screen.getByTestId('initial-values')).toHaveTextContent('null');
        });

        test('submit caption is btn:create', () => {
            renderCreate();
            expect(screen.getByTestId('submit-caption')).toHaveTextContent('btn:create');
        });

        test('submit calls createCollection with name_fr and name_en', async () => {
            renderCreate();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockCreateCollection).toHaveBeenCalledWith('Test FR', 'Test EN');
            });
        });

        test('does not call renameCollection on submit', async () => {
            renderCreate();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => expect(mockCreateCollection).toHaveBeenCalled());
            expect(mockRenameCollection).not.toHaveBeenCalled();
        });

        test('calls onCancel after successful submit', async () => {
            renderCreate();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockOnCancel).toHaveBeenCalled();
            });
        });
    });

    // --- Edit mode (collection = { id, name_fr, name_en }) ---

    describe('edit mode', () => {
        const renderEdit = () =>
            render(<CollectionForm collection={mockCollection} onCancel={mockOnCancel} />);

        test('passes name_fr and name_en as initialValues to Form', () => {
            renderEdit();
            const values = JSON.parse(screen.getByTestId('initial-values').textContent);
            expect(values).toEqual({ name_fr: 'Mer Rouge', name_en: 'Red Sea' });
        });

        test('submit caption is btn:save', () => {
            renderEdit();
            expect(screen.getByTestId('submit-caption')).toHaveTextContent('btn:save');
        });

        test('submit calls renameCollection with collection id and new names', async () => {
            renderEdit();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockRenameCollection).toHaveBeenCalledWith('c_1', 'Test FR', 'Test EN');
            });
        });

        test('does not call createCollection on submit', async () => {
            renderEdit();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => expect(mockRenameCollection).toHaveBeenCalled());
            expect(mockCreateCollection).not.toHaveBeenCalled();
        });

        test('calls onCancel after successful submit', async () => {
            renderEdit();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockOnCancel).toHaveBeenCalled();
            });
        });

        test('reinitialises form values when collection prop changes', async () => {
            const { rerender } = renderEdit();
            expect(JSON.parse(screen.getByTestId('initial-values').textContent))
                .toEqual({ name_fr: 'Mer Rouge', name_en: 'Red Sea' });

            const newCollection = { id: 'c_2', name_fr: 'Méditerranée', name_en: 'Mediterranean' };
            rerender(<CollectionForm collection={newCollection} onCancel={mockOnCancel} />);

            await waitFor(() => {
                expect(JSON.parse(screen.getByTestId('initial-values').textContent))
                    .toEqual({ name_fr: 'Méditerranée', name_en: 'Mediterranean' });
            });
        });
    });
});
