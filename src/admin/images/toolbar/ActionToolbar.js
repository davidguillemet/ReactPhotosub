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
import { useToast } from '../../../components/notifications';
import { useGlobalContext } from '../../../components/globalContext';
import { getThumbnailsFromImageName } from '../../../utils';

const isImageFile = (fullPath) => {
    return fullPath.endsWith(".jpg");
}

const ActionToolbar = () => {
    const context = useGlobalContext();
    const { toast } = useToast();
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

    const deleteItem = React.useCallback((itemFullPath) => {
        const promises = [];
        promises.push(context.dataProvider.removeStorageItem(itemFullPath));
        if (isImageFile(itemFullPath)) {
            const deleteItems = firebaseContext.deleteItems;
            promises.push(deleteItems(getThumbnailsFromImageName(itemFullPath)));
            promises.push(context.dataProvider.removeImageFromDatabase(itemFullPath));
        }
        return Promise.all(promises);

    }, [context, firebaseContext.deleteItems]);

    const onDeleteItems = React.useCallback(() => {
        setProcessing(true);
        const getSelection = imageContext.selection;
        const selection = getSelection();
        // Delete storage items
        const hasImage = selection.some(itemFullPath => isImageFile(itemFullPath));
        const promises = selection.map(itemFullPath => deleteItem(itemFullPath));
        return Promise.all(promises)
            .then(() => {
                const fetchItems = imageContext.fetchItems
                const refreshThumbnails = imageContext.refreshThumbnails;
                fetchItems();
                if (hasImage) {
                    refreshThumbnails();
                    context.clearDestinationImages( // Throttling
                        imageContext.destinationProps.year,
                        imageContext.destinationProps.title);
                }
            })
            .catch((e) => {
                toast.error(e.message);
            })
            .finally(() => {
                const unselectAll = imageContext.onUnselectAll;
                unselectAll();
                setProcessing(false);
            });
    }, [
        context,
        toast,
        imageContext.destinationProps,
        imageContext.selection,
        imageContext.fetchItems,
        imageContext.refreshThumbnails,
        imageContext.onUnselectAll,
        deleteItem
    ]);

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