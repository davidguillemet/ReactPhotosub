import React from 'react';
import { styled } from '@mui/material/styles';
import { Fab } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import useFormDialog from 'dialogs/FormDialog';
import DestinationForm from './DestinationForm';
import { useTranslation, destinationTitle } from 'utils';
import ConfirmDialog from 'dialogs/ConfirmDialog';
import { useAuthContext } from 'components/authentication';
import { useAsyncFetcher } from 'components/reactRouter';
import { DESTINATION_INTENT_DELETE } from 'utils/destinations';

const Div = styled('div')(() => {});

export default function useAdminActions() {

    const t = useTranslation("pages.destinations");
    const authContext = useAuthContext();

    const [destinationToEdit, setDestinationToEdit] = React.useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    const { dialogProps, openDialog, FormDialog } = useFormDialog();

    const { submit: fetcherSubmit } = useAsyncFetcher("subGalleryForm");

    const onNewDestination = React.useCallback(() => {
        setDestinationToEdit(null);
        openDialog();
    }, [openDialog]);

    const onEditDestination = React.useCallback((destination) => {
        setDestinationToEdit(destination);
        openDialog();
    }, [openDialog]);

    const onClickDeleteDestination = React.useCallback((destination) => {
        setDestinationToEdit(destination);
        setConfirmDeleteOpen(true);
    }, []);

    const onDeleteDestination = React.useCallback(() => {
        const deletePayload = {
            ...destinationToEdit,
            intent: DESTINATION_INTENT_DELETE
        };
        return fetcherSubmit(deletePayload);
    }, [fetcherSubmit, destinationToEdit]);

    const onCloseDestinationEditor = React.useCallback(() => {
        setDestinationToEdit(null);
    }, []);

    const AdminActionsComponent = React.useMemo(() => {

        const getDialogTitle = () => {
            if (destinationToEdit === null) {
                return t("title:newDestination")
            } else {
                return t("title:editDestination")
            }
        };

        const AdminActions = () => {
            if (authContext.admin === true) {
                return (
                    <React.Fragment>

                        <FormDialog title={getDialogTitle()} {...dialogProps}>
                            <DestinationForm
                                destination={destinationToEdit}
                                onCancel={onCloseDestinationEditor}
                            />
                        </FormDialog>

                        {
                            destinationToEdit &&
                            <ConfirmDialog
                                open={confirmDeleteOpen}
                                onOpenChanged={setConfirmDeleteOpen}
                                onValidate={onDeleteDestination}
                                title={t("title:confirmRemove")}
                                dialogContent={[
                                    t("confirmRemove", destinationTitle(destinationToEdit, t.language)),
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
                            <Fab onClick={onNewDestination} variant="extended">
                                <AddCircleOutlineIcon fontSize="large" sx={{ mr: 1 }} />
                                Ajouter une destination
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
        destinationToEdit,
        dialogProps,
        onDeleteDestination,
        onNewDestination,
        onCloseDestinationEditor,
        authContext.admin
    ]);

    return {
        AdminActions: AdminActionsComponent,
        onEditDestination,
        onClickDeleteDestination
    };
};
