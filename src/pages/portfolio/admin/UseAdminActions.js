import React from 'react';
import { styled } from '@mui/material/styles';
import { Fab } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import useFormDialog from 'dialogs/FormDialog';
import CategoryForm from './CategoryForm';
import { useTranslation } from 'utils';
import ConfirmDialog from 'dialogs/ConfirmDialog';
import { useAuthContext } from 'components/authentication';
import { useAsyncFetcher } from 'components/reactRouter';
import { PORTFOLIO_CATEGORY_INTENT_DELETE } from 'utils/portfolio';
import { useToast } from 'components/notifications';

const Div = styled('div')(() => {});

// Same Component as useAdminActions from destinations' page
// What could we do to make things in common?
export default function useAdminActions() {

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

        const AdminActions = () => {
            if (authContext.admin === true) {
                return (
                    <React.Fragment>

                        <FormDialog title={getDialogTitle()} {...dialogProps}>
                            <CategoryForm
                                category={categoryToEdit}
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
        authContext.admin
    ]);

    return {
        AdminActions: AdminActionsComponent,
        onEditCategory,
        onClickDeleteCategory
    };
};
