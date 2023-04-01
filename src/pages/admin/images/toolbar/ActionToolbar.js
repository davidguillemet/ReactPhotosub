import React from 'react';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box'
import {unstable_batchedUpdates} from 'react-dom';
import { IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useImageContext } from '../ImageContext';
import { Paragraph } from 'template/pageTypography';
import { HorizontalSpacing } from 'template/spacing';
import { ConfirmDialog } from 'dialogs';
import { useTranslation } from 'utils';
import { useToast } from 'components/notifications';
import { useOverlay } from 'components/loading';
import { useDataProvider } from 'components/dataProvider';

const isImageFile = (fullPath) => {
    return fullPath.endsWith(".jpg");
}

const ActionToolbar = () => {
    const dataProvider = useDataProvider();
    const imageContext = useImageContext();
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

    const deleteItem = React.useCallback((itemName) => {
        const promises = [];
        const itemFullPath = `${imageContext.bucketPath}/${itemName}`;
        promises.push(dataProvider.removeStorageItem(itemFullPath));
        if (isImageFile(itemName)) {
            const deleteThumbnails = imageContext.deleteThumbnails;
            promises.push(deleteThumbnails(itemFullPath));
            if (imageContext.isDestinationFolder) {
                promises.push(dataProvider.removeImageFromDatabase(itemFullPath));
            }
        }
        return Promise.all(promises);

    }, [
        dataProvider,
        imageContext.bucketPath,
        imageContext.isDestinationFolder,
        imageContext.deleteThumbnails
    ]);

    const onDeleteItems = React.useCallback(() => {
        setProcessing(true);
        const getSelection = imageContext.selection;
        const selection = getSelection();
        // Delete storage items
        const hasImage = selection.some(itemName => isImageFile(itemName));
        const promises = selection.map(itemName => deleteItem(itemName));
        return Promise.all(promises)
            .then(() => {
                const fetchItems = imageContext.fetchItems
                const refreshThumbnails = imageContext.refreshThumbnails;
                const clearImageQueries = imageContext.clearImageQueries;
                unstable_batchedUpdates(() => {
                    if (hasImage) {
                        refreshThumbnails();
                        clearImageQueries();
                    }
                    fetchItems();
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
        toast,
        setProcessing,
        imageContext.selection,
        imageContext.fetchItems,
        imageContext.refreshThumbnails,
        imageContext.clearImageQueries,
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
                    <Paragraph sx={{color: theme => theme.palette.secondary.contrastText}}>{`${imageContext.selectionCount} item(s) sélectionné(s)`}</Paragraph>
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