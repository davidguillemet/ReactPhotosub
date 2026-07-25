import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollectionForm from '../CollectionForm';
import Form from 'components/form';
import { useFavorites } from 'providers';
import { useTranslation, useNamespaceAllLanguages } from 'utils';

jest.mock('providers', () => ({ useFavorites: jest.fn() }));
jest.mock('utils', () => ({ useTranslation: jest.fn(), useNamespaceAllLanguages: jest.fn() }));

// Mock Form to capture the props passed to it (fields included, so tests can call a
// field's validator/errorText directly) and expose a submit trigger. Deliberately NOT a
// jest.fn() — for reasons not fully root-caused, a jest.fn()-wrapped default export of
// this particular mock silently fails to render under this project's React/RTL/Jest
// versions (component never invoked, no error). A plain function + a static
// `getLastProps` accessor sidesteps it while still letting tests inspect props.
jest.mock('components/form', () => {
    let lastProps = null;
    const FormMock = (props) => {
        lastProps = props;
        const { initialValues, submitCaption, submitAction, onCancel } = props;
        return (
            <div data-testid="form">
                <span data-testid="submit-caption">{submitCaption}</span>
                <span data-testid="initial-values">{JSON.stringify(initialValues)}</span>
                <button
                    data-testid="submit-btn"
                    onClick={() => submitAction({ name: 'Test Name' })}
                >
                    submit
                </button>
                <button data-testid="cancel-btn" onClick={onCancel}>cancel</button>
            </div>
        );
    };
    FormMock.getLastProps = () => lastProps;
    return {
        __esModule: true,
        default: FormMock,
        FIELD_TYPE_TEXT: 'text',
    };
});

const getNameField = () => Form.getLastProps().fields.find(field => field.id === 'name');

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const createMockT = (lang = 'en') => {
    const t = (key) => key;
    t.language = lang;
    return t;
};

const mockCollection = { id: 'c_1', name: 'Red Sea' };

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
        useNamespaceAllLanguages.mockReturnValue({ fr: { main: 'Principale' }, en: { main: 'Main' } });
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

        test('submit calls createCollection with name and no copy source', async () => {
            renderCreate();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockCreateCollection).toHaveBeenCalledWith('Test Name', undefined);
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

    // --- Edit mode (collection = { id, name }) ---

    describe('edit mode', () => {
        const renderEdit = () =>
            render(<CollectionForm collection={mockCollection} onCancel={mockOnCancel} />);

        test('passes name as initialValues to Form', () => {
            renderEdit();
            const values = JSON.parse(screen.getByTestId('initial-values').textContent);
            expect(values).toEqual({ name: 'Red Sea' });
        });

        test('submit caption is btn:save', () => {
            renderEdit();
            expect(screen.getByTestId('submit-caption')).toHaveTextContent('btn:save');
        });

        test('submit calls renameCollection with collection id and new name', async () => {
            renderEdit();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockRenameCollection).toHaveBeenCalledWith('c_1', 'Test Name');
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
                .toEqual({ name: 'Red Sea' });

            const newCollection = { id: 'c_2', name: 'Mediterranean' };
            rerender(<CollectionForm collection={newCollection} onCancel={mockOnCancel} />);

            await waitFor(() => {
                expect(JSON.parse(screen.getByTestId('initial-values').textContent))
                    .toEqual({ name: 'Mediterranean' });
            });
        });
    });

    // --- Copy mode (collection = null, copyFrom = { id, name }) ---

    describe('copy mode', () => {
        const copySource = { id: 'c_1', name: 'Red Sea' };
        const renderCopy = () =>
            render(<CollectionForm collection={null} copyFrom={copySource} onCancel={mockOnCancel} />);

        test('prefills the name field with the suffixed source name', () => {
            renderCopy();
            const values = JSON.parse(screen.getByTestId('initial-values').textContent);
            expect(values).toEqual({ name: 'lbl:copyName' }); // mock t() passthrough (no {0} substitution)
        });

        test('submit caption is btn:create', () => {
            renderCopy();
            expect(screen.getByTestId('submit-caption')).toHaveTextContent('btn:create');
        });

        test('submit calls createCollection with the new name and the source collection id', async () => {
            renderCopy();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockCreateCollection).toHaveBeenCalledWith('Test Name', 'c_1');
            });
        });

        test('does not call renameCollection on submit', async () => {
            renderCopy();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => expect(mockCreateCollection).toHaveBeenCalled());
            expect(mockRenameCollection).not.toHaveBeenCalled();
        });

        test('calls onCancel after successful submit', async () => {
            renderCopy();
            fireEvent.click(screen.getByTestId('submit-btn'));
            await waitFor(() => {
                expect(mockOnCancel).toHaveBeenCalled();
            });
        });
    });

    // --- Reserved name validation (name field) ---
    // The "name" field's validator/errorText must reject the "main" collection's translated
    // label in EVERY supported language, not just the one currently active — otherwise
    // switching language later could produce two rows both displaying as e.g. "Main".

    describe('reserved name validation', () => {
        test('rejects the current language\'s main label', () => {
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            expect(nameField.validator(nameField, 'Principale')).toBe(false);
        });

        test('rejects another supported language\'s main label, not just the active one', () => {
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            // Active mock language is 'en' (createMockT default), but 'Principale' is French.
            expect(nameField.validator(nameField, 'Principale')).toBe(false);
            expect(nameField.validator(nameField, 'Main')).toBe(false);
        });

        test('rejects case-insensitively and ignores surrounding whitespace', () => {
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            expect(nameField.validator(nameField, '  main  ')).toBe(false);
            expect(nameField.validator(nameField, 'PRINCIPALE')).toBe(false);
        });

        test('accepts a name that does not collide with any language\'s main label', () => {
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            expect(nameField.validator(nameField, 'Red Sea')).toBe(true);
        });

        test('rejects an empty value', () => {
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            expect(nameField.validator(nameField, '')).toBe(false);
        });

        test('does not reject anything while language resources are still loading', () => {
            useNamespaceAllLanguages.mockReturnValue(null);
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            expect(nameField.validator(nameField, 'Principale')).toBe(true);
        });

        test('errorText switches between the reserved-name and empty-name messages', () => {
            render(<CollectionForm collection={null} onCancel={mockOnCancel} />);
            const nameField = getNameField();
            expect(nameField.errorText('Principale')).toBe('error:reservedName');
            expect(nameField.errorText('')).toBe('error:emptyName');
            expect(nameField.errorText('Red Sea')).toBe('error:emptyName');
        });
    });
});
