import React from 'react';
import Fade from '@mui/material/Fade';
import { Stack } from '@mui/material';
import { IconButton } from '@mui/material';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import FileUploadSelection from '../upload/FileUploadSelection';
import StorageBreadcrumbs from './BreadCrumbs';
import useFormDialog from 'dialogs/FormDialog';
import { useImageContext } from '../ImageContext';
import { useUploadContext } from '../upload/UploadContext';
import { canUpload } from '../common';
import FolderForm from '../FolderForm';
import { HorizontalSpacing } from 'template/spacing';

const DefaultToolbar = () => {
    const uploadContext = useUploadContext();
    const imageContext = useImageContext();
    const { dialogProps, openDialog, FormDialog } = useFormDialog();      
    const uploadButtonRef = React.useRef(null);

    const openUploadSelection = () => {
        uploadButtonRef.current.click();
    };
    uploadContext.onClickUpload = openUploadSelection;

    const isUploadAvailable = canUpload(imageContext.folderType);

    return (
        <Fade in={imageContext.selectionCount === 0}>
            <Stack
                direction="row"
                justifyContent="space-between"
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                }}
            >
                <StorageBreadcrumbs />
                <Stack direction="row" alignItems="center">
                    <IconButton onClick={openDialog}>
                        <CreateNewFolderOutlinedIcon sx={{color: theme => theme.palette.primary.contrastText}}></CreateNewFolderOutlinedIcon>
                    </IconButton>
                    <FileUploadSelection
                        ref={uploadButtonRef}
                        disabled={!isUploadAvailable}
                    />
                    <HorizontalSpacing factor={1} />
                </Stack>
                <FormDialog title="Création d'un répertoire" {...dialogProps} >
                    <FolderForm />
                </FormDialog>
            </Stack>
         </Fade>
    );
}

export default DefaultToolbar;
