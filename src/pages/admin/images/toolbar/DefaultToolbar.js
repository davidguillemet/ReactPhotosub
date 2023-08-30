import React from 'react';
import Fade from '@mui/material/Fade';
import Box from '@mui/material/Box'
import { Stack } from '@mui/material';
import { IconButton } from '@mui/material';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import FileUploadSelection from '../upload/FileUploadSelection';
import StorageBreadcrumbs from './BreadCrumbs';
import FolderFormDialog from '../FolderFormDialog';
import { useImageContext } from '../ImageContext';
import { useUploadContext } from '../upload/UploadContext';
import { canUpload } from '../common';

const DefaultToolbar = () => {
    const uploadContext = useUploadContext();
    const imageContext = useImageContext();
    const [ folderDialogOpen, setFolderDialogOpen ] = React.useState(false);
    const uploadButtonRef = React.useRef(null);
    const openUploadSelection = () => uploadButtonRef.current.click()
    uploadContext.onClickUpload = openUploadSelection;

    const handleOnClickCreateFolder = React.useCallback(() => {
        setFolderDialogOpen(true);
    }, []);

    const onCloseFolderDialog = React.useCallback(() => {
        setFolderDialogOpen(false);
    }, []);

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
                    <IconButton onClick={handleOnClickCreateFolder}>
                        <CreateNewFolderOutlinedIcon sx={{color: theme => theme.palette.primary.contrastText}}></CreateNewFolderOutlinedIcon>
                    </IconButton>
                    <FileUploadSelection
                        ref={uploadButtonRef}
                        disabled={!isUploadAvailable}
                    />
                </Stack>
                <FolderFormDialog
                    open={folderDialogOpen}
                    onClose={onCloseFolderDialog}
                />
            </Box>
         </Fade>
    );
}

export default DefaultToolbar;
