import React from 'react';
import { Box } from '@mui/system';
import { Stack } from '@mui/material';
import { IconButton } from '@mui/material';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { useGlobalContext } from '../../components/globalContext';
import FolderFormDialog from './FolderFormDialog';
import FileUploadSelection from './FileUploadSelection';
import StorageBreadcrumbs from './BreadCrumbs';
import MissingStorageFolders from './MissingStorageFolders';
import UploadTableRows from './UploadTableRows';
import { ImageContextProvider, useImageContext } from './ImageContext';
import { UploadContextProvider, useUploadContext } from './UploadContext';
import TableFolders from './TableFolders';
import TableFiles from './TableFiles';

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  { id: 'thumbStatus', label: 'Thumbnail Status' }, // Ok if all thumbnails have been created
  { id: 'dbStatus', label: 'Database Status' },     // Ok if the image exists in database
];

const Images = () => {
    const imageContext = useImageContext();
    const uploadContext = useUploadContext();
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

    return (
        <React.Fragment>
        <TableContainer component={Paper}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    bgcolor: theme => theme.palette.secondary.light,
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
                        disabled={imageContext.destinationProps.year === null || imageContext.destinationProps.title === null}
                    />
                </Stack>
            </Box>
            <Table sx={{ width: "100%" }} size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                indeterminate={imageContext.manySelected}
                                checked={imageContext.allSelected}
                                onChange={imageContext.onSelectAllClick}
                                inputProps={{
                                    'aria-label': 'select all items',
                                }}
                            />
                        </TableCell>
                        {
                            columns.map(column => {
                                return (
                                    <TableCell
                                        key={column.id}
                                        align={'left'}
                                    >
                                        {column.label}
                                    </TableCell>
                                )
                            })
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    <UploadTableRows />
                    <MissingStorageFolders dbFolders={imageContext.rows.missingFolders} />
                    {
                        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
                        imageContext.rows.folders !== undefined && 
                        <TableFolders folders={imageContext.rows.folders} />
                    }
                    {
                         // Don't use withLoading since a CircularProgress cannot be a child of TableBody
                        imageContext.rows.files !== undefined &&
                        <TableFiles files={imageContext.rows.files} />
                    }
                </TableBody>
            </Table>
        </TableContainer>
        <FolderFormDialog
            open={folderDialogOpen}
            onClose={onCloseFolderDialog}
        />
        </React.Fragment>
    )
}

const ImagesController = () => {
    const context = useGlobalContext();
    const { data: folders } = context.useFetchImageFolders();
    return (
        <ImageContextProvider foldersFromDb={folders}>
            <UploadContextProvider>
                <Images foldersFromDb={folders} />
            </UploadContextProvider>
        </ImageContextProvider>
    )
}

export default ImagesController;