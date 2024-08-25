import React from 'react';
import Box from '@mui/material/Box';
import { useQueryContext } from 'components/queryContext';
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

const _getAvailableImages = (images) => {
    return images.filter(image => image.sub_gallery_id === null);
}

export const SubGalleryHeaderComponent = ({ group }) => {
    const galleryContext = useDestinationGalleryContext();
    const queryContext = useQueryContext();

    const deleteGalleryMutation = queryContext.useDeleteSubGallery();
    const updateGalleryImagesMutation = queryContext.useUpdateSubGalleryImages();
    const updateGalleryIndices = queryContext.useUpdateSubGalleryIndices();

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
        return deleteGalleryMutation.mutateAsync(group)
            .then(() => {
                toast.success("La galerie a été supprimée.");
            });
    }, [group, deleteGalleryMutation, toast]);

    const onSelectImages = React.useCallback(() => {
        openImageDialog();
    }, [openImageDialog]);

    const onValidateImages = React.useCallback((selection) => {
        const updatePayload = {
            destination: galleryContext.destination,
            galleryId: group.gallery.id,
            add: [],
            remove: []
        };
        // Set gallery id for the final selection
        selection.forEach(image => updatePayload.add.push(image.id));
        // Clear gallery id for the images that has been removed
        if (group.images !== null) {
            const removedImages = group.images.filter(image => selection.indexOf(image) === -1);
            removedImages.forEach(image => updatePayload.remove.push(image.id));
        }
        return updateGalleryImagesMutation.mutateAsync(updatePayload)
            .then(() => {
                toast.success("La galerie a été mise à jour.");
            });
    }, [
        toast,
        group.gallery.id,
        group.images,
        updateGalleryImagesMutation,
        galleryContext.destination
    ]);

    const canDecreaseIndex = React.useCallback(() => {
        return group.gallery.index > 1;
    }, [group.gallery]);

    const canIncreaseIndex = React.useCallback(() => {
        const maxIndex = galleryContext.galleries.reduce((maxIndex, gallery) => gallery.index > maxIndex ? gallery.index : maxIndex, 0);
        return group.gallery.index < maxIndex;
    }, [galleryContext.galleries, group.gallery.index]);

    const updateGalleries = React.useCallback((updateInfos) => {
        const updatePayload = {
            update: updateInfos,
            destination: galleryContext.destination
        };
        updateGalleryIndices.mutateAsync(updatePayload);
    }, [galleryContext.destination, updateGalleryIndices]);

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

            <ImageFormDialog title="Gérer les images de la sous-galerie" {...ImageDialogProps}>
                <TransferList
                    allItems={initialDestinationImages.current}
                    rightList={initialGroupImages.current}
                    renderItem={RenderTransferListImage}
                    sortFunc={sortImagesAscending}
                    onValidate={onValidateImages} />
            </ImageFormDialog>
            <EditFormDialog title="Modifier la sous-galerie" {...EditDialogProps}>
                <SubGalleryForm subGallery={group.gallery} destination={group.destination} />
            </EditFormDialog>
            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChanged={setConfirmDeleteOpen}
                onValidate={onDeleteGallery}
                title={"Supprimer la galerie"}
                dialogContent={[
                    `Confirmez-vous la suppression de la galerie '${group.gallery.title}'?`,
                    "Cette action est irreversible!"
                ]} />
        </Box>
        </GroupContextProvider>
    );
};
