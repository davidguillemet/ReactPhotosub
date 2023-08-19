import React from 'react';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box'
import { IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useImageContext } from '../ImageContext';
import { Paragraph } from 'template/pageTypography';
import { HorizontalSpacing } from 'template/spacing';
import { ConfirmDialog } from 'dialogs';
import { useTranslation } from 'utils';
import { useToast } from 'components/notifications';
import { useOverlay } from 'components/loading';
import { ITEM_TYPE_FILE, ITEM_TYPE_FOLDER } from '../common';

const isImageFile = (fullPath) => {
    return fullPath.endsWith(".jpg");
}

const ActionToolbar = () => {
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
        const getItemFullPath = imageContext.getItemFullPath;
        const itemFullPath = getItemFullPath(itemName);
        const isImage = isImageFile(itemFullPath);
        const deleteStorageItem = imageContext.deleteStorageItem;
        promises.push(deleteStorageItem(itemFullPath, isImage ? ITEM_TYPE_FILE : ITEM_TYPE_FOLDER));
        if (isImageFile(itemName)) {
            const deleteThumbnails = imageContext.deleteThumbnails;
            promises.push(deleteThumbnails(itemFullPath));
            if (imageContext.isDestinationFolder) {
                const deleteImageFromDatabase = imageContext.deleteImageFromDatabase;
                promises.push(deleteImageFromDatabase(itemFullPath));
            }
        }
        return Promise.all(promises);

    }, [
        imageContext.getItemFullPath,
        imageContext.isDestinationFolder,
        imageContext.deleteThumbnails,
        imageContext.deleteStorageItem,
        imageContext.deleteImageFromDatabase
    ]);

    const onDeleteItems = React.useCallback(() => {
        setProcessing(true);
        const getSelection = imageContext.selection;
        const selection = getSelection();
        // Delete storage items
        const promises = selection.map(itemName => deleteItem(itemName));
        return Promise.all(promises)
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