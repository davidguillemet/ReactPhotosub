import React from 'react';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box'
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

const DefaultToolbar = () => {
    const uploadContext = useUploadContext();
    const imageContext = useImageContext();
    const { dialogProps, openDialog, FormDialog } = useFormDialog();      
    const uploadButtonRef = React.useRef(null);
    const openUploadSelection = () => uploadButtonRef.current.click()
    uploadContext.onClickUpload = openUploadSelection;

    const isUploadAvailable = canUpload(imageContext.folderType);

    return (
        <Fade in={imageContext.selectionCount === 0}>
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
                <StorageBreadcrumbs />
                <Stack direction="row" alignItems="center">
                    <IconButton onClick={openDialog}>
                        <CreateNewFolderOutlinedIcon sx={{color: theme => theme.palette.primary.contrastText}}></CreateNewFolderOutlinedIcon>
                    </IconButton>
                    <FileUploadSelection
                        ref={uploadButtonRef}
                        disabled={!isUploadAvailable}
                    />
                </Stack>
                <FormDialog title="Création d'un répertoire" {...dialogProps} >
                    <FolderForm />
                </FormDialog>
            </Box>
         </Fade>
    );
}

export default DefaultToolbar;
