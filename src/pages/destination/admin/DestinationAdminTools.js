import React from 'react';
import { Stack } from '@mui/material';
import { useAuthContext } from 'components/authentication';
import { useHistory } from 'react-router-dom';
import useFormDialog from 'dialogs/FormDialog';
import SubGalleryForm from './SubGalleryForm';
import { Fab } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

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
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '100px',
                    zIndex: (theme) => theme.zIndex.drawer
                }}
            >
                <Fab
                    onClick={onAddSubGallery}
                    variant="extended"
                >
                    <AddCircleOutlineIcon fontSize="large" sx={{ mr: 1 }} />
                    Ajouter une sous-galerie
                </Fab>
                <Fab
                    onClick={onManageImages}
                    variant="extended"
                >
                    <TuneOutlinedIcon fontSize="large" sx={{ mr: 1 }} />
                    Gérer les images
                </Fab>
            </Stack>
            <FormDialog title="Créer une sous-galerie" {...dialogProps}>
                <SubGalleryForm subGallery={subGalleryToEdit} destination={destination}/>
            </FormDialog>
        </React.Fragment>
    );
};

export default DestinationAdminTools;