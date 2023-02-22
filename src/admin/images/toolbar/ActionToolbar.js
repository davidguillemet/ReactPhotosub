import React from 'react';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box'
import {unstable_batchedUpdates} from 'react-dom';
import { IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useImageContext } from '../ImageContext';
import { Paragraph } from '../../../template/pageTypography';
import { HorizontalSpacing } from '../../../template/spacing';
import { ConfirmDialog } from '../../../dialogs';
import { useTranslation } from '../../../utils';
import { useFirebaseContext } from '../../../components/firebase';
import { useToast } from '../../../components/notifications';
import { useGlobalContext } from '../../../components/globalContext';
import { getThumbnailsFromImageName } from '../../../utils';
import { useOverlay } from '../../../components/loading';

const isImageFile = (fullPath) => {
    return fullPath.endsWith(".jpg");
}

const ActionToolbar = () => {
    const context = useGlobalContext();
    const imageContext = useImageContext();
    const firebaseContext = useFirebaseContext();
    const { toast } = useToast();
    const t = useTranslation("pages.admin.images");

    const [ confirmDeleteOen, setConfirmDeleteOen ] = React.useState(false);
    const { setOverlay: setProcessing } = useOverlay();

    const handleOnClose = React.useCallback(() => {
        const unselectAll = imageContext.onUnselectAll;
        unselectAll();
    }, [imageContext.onUnselectAll]);

    const handleOnClickDelete = React.useCallback(() => {
        setConfirmDeleteOen(true);
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
                unstable_batchedUpdates(() => {
                    fetchItems();
                    if (hasImage) {
                        refreshThumbnails();
                        context.clearDestinationImages( // Throttling
                            imageContext.destinationProps.year,
                            imageContext.destinationProps.title);
                    }
                })
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
        setProcessing,
        imageContext.destinationProps,
        imageContext.selection,
        imageContext.fetchItems,
        imageContext.refreshThumbnails,
        imageContext.onUnselectAll,
        deleteItem
    ]);

    return (
        <Fade in={imageContext.selectionCount > 0}>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "row",
                    flexGrow: 1,
                    justifyContent: "space-between",
                    padding: 1
                }}
            >
                <Stack direction="row" alignItems="center">
                    <IconButton onClick={handleOnClose}>
                        <CloseIcon fontSize="small" sx={{color: theme => theme.palette.secondary.contrastText}}/>
                    </IconButton>
                    <HorizontalSpacing />
                    <Paragraph sx={{color: theme => theme.palette.secondary.contrastText}}>{`${imageContext.selectionCount} item(s)`}</Paragraph>
                    <HorizontalSpacing factor={4} />
                    <Button variant="contained" onClick={handleOnClickDelete}>{"Supprimer"}</Button>
                </Stack>

                <ConfirmDialog
                    open={confirmDeleteOen}
                    onOpenChanged={setConfirmDeleteOen}
                    onValidate={onDeleteItems}
                    title={t("title:deleteItems")}
                    dialogContent={[
                        t("confirmDeleteItems"),
                        t("warningDeleteItems")
                    ]}
                />

            </Box>
        </Fade>
    );
}

export default ActionToolbar;