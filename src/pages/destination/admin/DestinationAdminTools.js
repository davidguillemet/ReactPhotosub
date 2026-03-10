import React from 'react';
import { Stack } from '@mui/material';
import { useAuthContext } from 'components/authentication';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'utils';
import useFormDialog from 'dialogs/FormDialog';
import SubGalleryForm from './SubGalleryForm';
import { Fab } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

const DestinationAdminTools = ({destination}) => {
    const t = useTranslation("pages.destinationAdmin.tools");
    const authContext = useAuthContext();
    const navigate = useNavigate();
    const { dialogProps, openDialog, FormDialog } = useFormDialog();
    const [ subGalleryToEdit, setSubGalleryToEdit ] = React.useState(null);

    const onAddSubGallery = React.useCallback(() => {
        setSubGalleryToEdit(null);
        openDialog();
    }, [openDialog]);

    const onManageImages = React.useCallback(() => {
        navigate(`/admin?tab=images&path=${encodeURIComponent(destination.path)}`);
    }, [navigate, destination]);

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
                    {t("btn:addSubGallery")}
                </Fab>
                <Fab
                    onClick={onManageImages}
                    variant="extended"
                >
                    <TuneOutlinedIcon fontSize="large" sx={{ mr: 1 }} />
                    {t("btn:manageImages")}
                </Fab>
            </Stack>
            <FormDialog title={t("dlg:createSubGallery")} {...dialogProps}>
                <SubGalleryForm subGallery={subGalleryToEdit} destination={destination}/>
            </FormDialog>
        </React.Fragment>
    );
};

export default DestinationAdminTools;