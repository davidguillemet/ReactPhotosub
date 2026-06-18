import React from 'react';
import { styled } from '@mui/material/styles';
import { Fab } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import useFormDialog from 'dialogs/FormDialog';
import CategoryForm from './CategoryForm';
import { useTranslation } from 'utils';
import ConfirmDialog from 'dialogs/ConfirmDialog';
import { useAuthContext } from 'components/authentication';
import { useAsyncFetcher } from 'components/reactRouter';
import {
    PORTFOLIO_CATEGORY_INTENT_DELETE,
    FILTER_VALUE_EXCLUDED_FROM_CATEGORY,
    FILTER_VALUE_INCLUDED_IN_CATEGORY }
from 'utils/portfolio';
import { useToast } from 'components/notifications';

const Div = styled('div')(() => {});

const StatusFilter = ({ onFilterChange }) => {

    const [filter, setFilter] = React.useState([FILTER_VALUE_INCLUDED_IN_CATEGORY, FILTER_VALUE_EXCLUDED_FROM_CATEGORY]);
    const handleOnToggleIncluded = React.useCallback(() => {
        setFilter(prev => prev.includes(FILTER_VALUE_INCLUDED_IN_CATEGORY) ? prev.filter(f => f !== FILTER_VALUE_INCLUDED_IN_CATEGORY) : [...prev, FILTER_VALUE_INCLUDED_IN_CATEGORY]);
    }, []);
    const handleOnToggleExcluded = React.useCallback(() => {
        setFilter(prev => prev.includes(FILTER_VALUE_EXCLUDED_FROM_CATEGORY) ? prev.filter(f => f !== FILTER_VALUE_EXCLUDED_FROM_CATEGORY) : [...prev, FILTER_VALUE_EXCLUDED_FROM_CATEGORY]);
    }, []);

    React.useEffect(() => {
        onFilterChange(filter);
    }, [filter, onFilterChange]);

    return (
        <React.Fragment>
            <Fab color={filter.includes(FILTER_VALUE_INCLUDED_IN_CATEGORY) ? "success" : "default"} sx={{ ml: 1 }} onClick={handleOnToggleIncluded}>
                <VisibilityIcon />
            </Fab>
            <Fab color={filter.includes(FILTER_VALUE_EXCLUDED_FROM_CATEGORY) ? "success" : "default"} sx={{ ml: 1 }} onClick={handleOnToggleExcluded}>
                <VisibilityOffIcon />
            </Fab>
        </React.Fragment>
    );
};

// Same Component as useAdminActions from destinations' page
// What could we do to make things in common?
export default function useAdminActions(onFilterChange) {

    const t = useTranslation("pages.portfolio.admin");
    const authContext = useAuthContext();
    const { toast } = useToast();

    const [categoryToEdit, setCategoryToEdit] = React.useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    const { dialogProps, openDialog, FormDialog } = useFormDialog();

    const { submit: fetcherSubmit } = useAsyncFetcher("subGalleryForm");

    const onNewCategory = React.useCallback(() => {
        setCategoryToEdit(null);
        openDialog();
    }, [openDialog]);

    const onEditCategory = React.useCallback((category) => {
        setCategoryToEdit(category);
        openDialog();
    }, [openDialog]);

    const onClickDeleteCategory = React.useCallback((category) => {
        setCategoryToEdit(category);
        setConfirmDeleteOpen(true);
    }, []);

    const onDeleteCategory = React.useCallback(() => {
        const deletePayload = {
            ...categoryToEdit,
            intent: PORTFOLIO_CATEGORY_INTENT_DELETE
        };
        fetcherSubmit(deletePayload).then((data) => {
            toast.success(t("success:catDeleted", categoryToEdit.key));
        }).catch(e => {
            toast.error(e.message);
        });
    }, [fetcherSubmit, categoryToEdit, toast, t]);

    const onCloseCategoryEditor = React.useCallback(() => {
        setCategoryToEdit(null);
    }, []);

    const AdminActionsComponent = React.useMemo(() => {

        const getDialogTitle = () => {
            if (categoryToEdit === null) {
                return t("dlg:createCategory")
            } else {
                return t("dlg:editCategory")
            }
        };

        const AdminActions = ({galleryContent, categories}) => {
            if (authContext.admin === true) {
                return (
                    <React.Fragment>

                        <FormDialog title={getDialogTitle()} {...dialogProps}>
                            <CategoryForm
                                category={categoryToEdit}
                                categories={categories}
                                onCancel={onCloseCategoryEditor}
                            />
                        </FormDialog>

                        {
                            categoryToEdit &&
                            <ConfirmDialog
                                open={confirmDeleteOpen}
                                onOpenChanged={setConfirmDeleteOpen}
                                onValidate={onDeleteCategory}
                                title={t("title:confirmRemove")}
                                dialogContent={[
                                    t("confirmRemove", categoryToEdit.key),
                                    t("warningConfirmRemove")
                                ]}
                            />
                        }

                        <Div
                            sx={{
                                position: 'fixed',
                                bottom: '20px',
                                right: '100px',
                                zIndex: (theme) => theme.zIndex.drawer
                            }}
                        >
                            <Fab onClick={onNewCategory} variant="extended">
                                <AddCircleOutlineIcon fontSize="large" sx={{ mr: 1 }} />
                                {t("btn:addCategory")}
                            </Fab>
                            {
                                galleryContent === "groupImages" &&
                                <StatusFilter onFilterChange={onFilterChange} />
                            }
                        </Div>

                    </React.Fragment>
                );
            } else {
                return null;
            }
        };
        return AdminActions;
    }, [
        t,
        confirmDeleteOpen,
        categoryToEdit,
        dialogProps,
        onDeleteCategory,
        onNewCategory,
        onCloseCategoryEditor,
        onFilterChange,
        authContext.admin
    ]);

    return {
        AdminActions: AdminActionsComponent,
        onEditCategory,
        onClickDeleteCategory
    };
};
