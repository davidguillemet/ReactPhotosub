import React from 'react';
import { IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useImageContext } from '../ImageContext';
import { Paragraph } from '../../../template/pageTypography';
import { HorizontalSpacing } from '../../../template/spacing';
import { ConfirmDialog } from '../../../dialogs';
import { useTranslation } from '../../../utils';
import { useFirebaseContext } from '../../../components/firebase';
import LoadingOverlay from '../../../components/loading';

const ActionToolbar = () => {
    const imageContext = useImageContext();
    const firebaseContext = useFirebaseContext();
    const t = useTranslation("pages.admin.images");
    const [ confirmDelete, setConfirmDelete ] = React.useState(false);
    const [ processing, setProcessing ] = React.useState(false);

    const handleOnClose = React.useCallback(() => {
        const unselectAll = imageContext.onUnselectAll;
        unselectAll();
    }, [imageContext.onUnselectAll]);

    const handleOnClickDelete = React.useCallback(() => {
        setConfirmDelete(true);
    }, []);

    const onConfirmDeleteOpenChanged = React.useCallback((open) => {
        if (open === false) {
            setConfirmDelete(false);
        }
    }, []);

    const onDeleteItems = React.useCallback(() => {
        setProcessing(true);
        const getSelection = imageContext.selection;
        const deleteItems = firebaseContext.deleteItems;
        // TODO : for each file item, remove thumbnails and db entry
        return deleteItems(getSelection())
            .finally(() => {
                setProcessing(false);
            })
    }, [imageContext.selection, firebaseContext.deleteItems]);

    return (
        <React.Fragment>
            <Stack direction="row" alignItems="center">
                <IconButton>
                    <CloseIcon fontSize="small" onClick={handleOnClose} sx={{color: theme => theme.palette.secondary.contrastText}}/>
                </IconButton>
                <HorizontalSpacing />
                <Paragraph sx={{color: theme => theme.palette.secondary.contrastText}}>{`${imageContext.selectionCount} item(s)`}</Paragraph>
                <HorizontalSpacing factor={4} />
                <Button variant="contained" onClick={handleOnClickDelete}>{"Supprimer"}</Button>
            </Stack>

            <ConfirmDialog
                open={confirmDelete}
                onOpenChanged={onConfirmDeleteOpenChanged}
                onValidate={onDeleteItems}
                title={t("title:deleteItems")}
                dialogContent={[
                    t("confirmDeleteItems"),
                    t("warningDeleteItems")
                ]}
            />

            <LoadingOverlay open={processing} />

        </React.Fragment>
    );
}

export default ActionToolbar;