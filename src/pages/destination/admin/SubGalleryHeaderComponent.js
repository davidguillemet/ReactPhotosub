import React from 'react';
import { useAsyncFetcher } from 'components/reactRouter';
import { useTranslation } from 'utils';
import Box from '@mui/material/Box';
import useFormDialog from 'dialogs/FormDialog';
import SubGalleryForm from './SubGalleryForm';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { ConfirmDialog } from 'dialogs';
import { useToast } from 'components/notifications';
import TransferList from 'components/transferList';
import { useDestinationGalleryContext } from './DestinationGalleryContext';
import { sortImagesAscending } from 'utils';
import { RenderTransferListImage } from './RenderTransferListImage';
import { GroupContextProvider } from './GroupContext';
import {
    SUB_GALLERY_INTENT_UPDATE_INDICES,
    SUB_GALLERY_INTENT_DELETE,
    SUB_GALLERY_INTENT_UPDATE_IMAGES
} from 'utils/destinations';

const _getAvailableImages = (images) => {
    return images.filter(image => image.sub_gallery_id === null);
}

export const SubGalleryHeaderComponent = ({ group }) => {
    const t = useTranslation("pages.destinationAdmin.subGalleryHeader");
    const galleryContext = useDestinationGalleryContext();
    const { submit: fetcherSubmit } = useAsyncFetcher("subGalleryForm");

    const { toast } = useToast();
    const { dialogProps: EditDialogProps, openDialog: openEditDialog, FormDialog: EditFormDialog } = useFormDialog();
    const { dialogProps: ImageDialogProps, openDialog: openImageDialog, FormDialog: ImageFormDialog } = useFormDialog();
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

    const initialGroupImages = React.useRef([...group.images]);
    const initialDestinationImages = React.useRef(_getAvailableImages(galleryContext.images));

    React.useEffect(() => {
        initialGroupImages.current = [...group.images];
    }, [group.images]);
    React.useEffect(() => {
        initialDestinationImages.current = _getAvailableImages(galleryContext.images);
    }, [galleryContext.images]);

    const onEditGallery = React.useCallback(() => {
        openEditDialog();
    }, [openEditDialog]);

    const onConfirmDeleteGallery = React.useCallback(() => {
        setConfirmDeleteOpen(true);
    }, []);

    const onDeleteGallery = React.useCallback(() => {
        const deletePayload = {
            ...group.gallery,
            intent: SUB_GALLERY_INTENT_DELETE,
            destinationPath: galleryContext.destination.path
        }; 
        fetcherSubmit(deletePayload).then(() => {
            toast.success(t("success:deleted"));
        });
    }, [group, galleryContext.destination, fetcherSubmit, toast, t]);

    const onSelectImages = React.useCallback(() => {
        openImageDialog();
    }, [openImageDialog]);

    const onValidateImages = React.useCallback((selection) => {
        const updatePayload = {
            destination: galleryContext.destination,
            galleryId: group.gallery.id,
            add: [],
            remove: [],
            intent: SUB_GALLERY_INTENT_UPDATE_IMAGES,
            destinationPath: galleryContext.destination.path
        };
        // Set gallery id for the final selection
        selection.forEach(image => updatePayload.add.push(image.id));
        // Clear gallery id for the images that has been removed
        if (group.images !== null) {
            const removedImages = group.images.filter(image => selection.indexOf(image) === -1);
            removedImages.forEach(image => updatePayload.remove.push(image.id));
        }
        return fetcherSubmit(updatePayload).then(() => {
            toast.success(t("success:updated"));
        });
    }, [
        toast,
        group.gallery.id,
        group.images,
        fetcherSubmit,
        galleryContext.destination,
        t
    ]);

    const canDecreaseIndex = React.useCallback(() => {
        const minIndex = galleryContext.galleries.reduce((minIndex, gallery) => gallery.index < minIndex ? gallery.index : minIndex, Infinity);
        return group.gallery.index > minIndex;
    }, [galleryContext.galleries, group.gallery]);

    const canIncreaseIndex = React.useCallback(() => {
        const maxIndex = galleryContext.galleries.reduce((maxIndex, gallery) => gallery.index > maxIndex ? gallery.index : maxIndex, 0);
        return group.gallery.index < maxIndex;
    }, [galleryContext.galleries, group.gallery.index]);

    const updateGalleries = React.useCallback((updateInfos) => {
        const updatePayload = {
            update: updateInfos,
            destination: galleryContext.destination,
            intent: SUB_GALLERY_INTENT_UPDATE_INDICES,
            destinationPath: galleryContext.destination.path
        };
        fetcherSubmit(updatePayload).then(() => {
            toast.success(t("success:updated"));
        });
    }, [galleryContext.destination, toast, fetcherSubmit, t]);

    const onIndexUp = React.useCallback(() => {
        const currentGalleryIndex = galleryContext.galleries.findIndex(gallery => gallery.id === group.gallery.id);
        const nextGallery = galleryContext.galleries[currentGalleryIndex + 1];
        // Switch indices
        updateGalleries([
            { id: group.gallery.id, index: nextGallery.index },
            { id: nextGallery.id, index: group.gallery.index }
        ]);
    }, [galleryContext.galleries, group, updateGalleries]);
    const onIndexDown = React.useCallback(() => {
        const currentGalleryIndex = galleryContext.galleries.findIndex(gallery => gallery.id === group.gallery.id);
        const prevGallery = galleryContext.galleries[currentGalleryIndex - 1];
        // Switch indices
        updateGalleries([
            { id: group.gallery.id, index: prevGallery.index },
            { id: prevGallery.id, index: group.gallery.index }
        ]);
    }, [galleryContext.galleries, group, updateGalleries]);

    return (
        <GroupContextProvider group={group}>
        <Box>
            <IconButton
                sx={{ color: theme => theme.palette.primary.contrastText }}
                onClick={onConfirmDeleteGallery}
            >
                <DeleteIcon />
            </IconButton>
            <IconButton
                sx={{ color: theme => theme.palette.primary.contrastText }}
                onClick={onEditGallery}
            >
                <EditIcon />
            </IconButton>
            <IconButton
                sx={{ color: theme => theme.palette.primary.contrastText }}
                onClick={onSelectImages}
            >
                <CollectionsIcon />
            </IconButton>
            <IconButton
                sx={{ color: theme => theme.palette.primary.contrastText }}
                onClick={onIndexUp}
                disabled={!canIncreaseIndex()}
            >
                <ArrowDownwardIcon />
            </IconButton>
            <IconButton
                sx={{ color: theme => theme.palette.primary.contrastText }}
                onClick={onIndexDown}
                disabled={!canDecreaseIndex()}
            >
                <ArrowUpwardIcon />
            </IconButton>

            <ImageFormDialog title={t("dlg:manageImages")} {...ImageDialogProps}>
                <TransferList
                    allItems={initialDestinationImages.current}
                    rightList={initialGroupImages.current}
                    renderItem={RenderTransferListImage}
                    sortFunc={sortImagesAscending}
                    onValidate={onValidateImages} />
            </ImageFormDialog>
            <EditFormDialog title={t("dlg:edit")} {...EditDialogProps}>
                <SubGalleryForm subGallery={group.gallery} destination={group.destination} />
            </EditFormDialog>
            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChanged={setConfirmDeleteOpen}
                onValidate={onDeleteGallery}
                title={t("dlg:deleteTitle")}
                dialogContent={[
                    t("dlg:deleteConfirmation", [group.gallery.title]),
                    t("dlg:deleteWarning")
                ]} />
        </Box>
        </GroupContextProvider>
    );
};
