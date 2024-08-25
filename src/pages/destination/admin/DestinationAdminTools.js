import React from 'react';
import { Button, Stack } from '@mui/material';
import { useAuthContext } from 'components/authentication';
import { useHistory } from 'react-router-dom';
import useFormDialog from 'dialogs/FormDialog';
import SubGalleryForm from './SubGalleryForm';
import { VerticalSpacing } from 'template/spacing';

const DestinationAdminTools = ({destination}) => {
    const authContext = useAuthContext();
    const history = useHistory();
    const { dialogProps, openDialog, FormDialog } = useFormDialog();
    const [ subGalleryToEdit, setSubGalleryToEdit ] = React.useState(null);

    const onAddSubGallery = React.useCallback(() => {
        setSubGalleryToEdit(null);
        openDialog();
    }, [openDialog]);

    const onManageImages = React.useCallback(() => {
        history.push(`/admin?tab=images&path=${encodeURIComponent(destination.path)}`)
    }, [history, destination]);

    if (!authContext.admin) {
        return null;
    }

    return (
        <React.Fragment>
            <VerticalSpacing factor={2} />
            <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={onAddSubGallery}>Ajouter une sous-galerie</Button>
                <Button variant="contained" onClick={onManageImages}>Gérer les images</Button>
            </Stack>
            <VerticalSpacing factor={2} />
            <FormDialog title="Créer une sous-galerie" {...dialogProps}>
                <SubGalleryForm subGallery={subGalleryToEdit} destination={destination}/>
            </FormDialog>
        </React.Fragment>
    );
};

export default DestinationAdminTools;