import React from 'react';
import { styled } from '@mui/material/styles';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { useQueryContext } from 'components/queryContext';
import MissingStorageFolders from './MissingStorageFolders';
import { ImageContextProvider, useImageContext } from './ImageContext';
import { UploadContextProvider, useUploadContext } from './upload/UploadContext';
import TableFolders from './TableFolders';
import TableFiles from './TableFiles';
import TableToolbar from './toolbar/TableToolbar';
import { CircularProgress } from '@mui/material';
import { Paragraph } from 'template/pageTypography';
import { FOLDER_TYPE } from './common';
import ImageErrors from './globalErrors/ImageErrors';
import { useTranslation } from 'utils';
import ItemFilter from './ItemFilter';
import { Fab } from "@mui/material";
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'thumbStatus', label: 'Thumbnail Status' }, // Ok if all thumbnails have been created
  { id: 'dbStatus', label: 'Database Status' },     // Ok if the image exists in database
  { id: 'tags', label: '...' }                     // Ok if the tags column is not null
];

const Div = styled('div')(() => {});

const Images = () => {
    const history = useHistory();
    const imageContext = useImageContext();
    const uploadContext = useUploadContext();
    const t = useTranslation("pages.admin.images");
    const folderName = imageContext.folderType === FOLDER_TYPE.root ? t("rootFolder") : imageContext.folderName;

    const onDisplayDestination = React.useCallback(() => {
        history.push(`/destinations/${imageContext.destinationPath}`)
    }, [history, imageContext.destinationPath]);

    const onClickUpload = React.useCallback(() => {
        const uploadImage = uploadContext.onClickUpload;
        uploadImage();
    }, [uploadContext.onClickUpload]);

    const AdminTools = () => {
        return (
            <Div
                sx={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '100px',
                    zIndex: (theme) => theme.zIndex.drawer
                }}
            >
                <Fab
                    variant="extended"
                    disabled={imageContext.folderType !== FOLDER_TYPE.destination}
                    onClick={onClickUpload}
                >
                    <CloudUploadOutlinedIcon fontSize="large" sx={{ mr: 1 }} />
                    Ajouter une image
                </Fab>
                <Fab
                    variant="extended"
                    disabled={imageContext.folderType !== FOLDER_TYPE.destination}
                    onClick={onDisplayDestination}
                >
                    <CollectionsOutlinedIcon fontSize="large" sx={{ mr: 1 }} />
                    Afficher la destination
                </Fab>
            </Div>
        )
    }

    return (
        <Stack direction="column" alignItems="flex-start" spacing={1}>
        <ImageErrors />
        <Paragraph>{t("imageCount", [imageContext.itemCount, folderName])}</Paragraph>
        <AdminTools />
        <ItemFilter />
        <TableContainer component={Paper} sx={{display: 'flex', flexDirection: 'column'}}>
            <TableToolbar />
            <Table sx={{ width: "100%" }} size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                indeterminate={imageContext.manySelected}
                                checked={imageContext.allSelected}
                                onChange={imageContext.onSelectAll}
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
                    {
                        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
                        imageContext.ready === true && 
                        <React.Fragment>
                            <MissingStorageFolders />
                            <TableFolders />
                            <TableFiles />
                        </React.Fragment>
                    }
                </TableBody>
            </Table>
            {
                imageContext.ready === false &&
                <Box sx={{padding: 1}} >
                    <CircularProgress></CircularProgress>
                </Box>
            }
        </TableContainer>
        </Stack>
    )
}

const ImagesController = () => {
    const queryContext = useQueryContext();
    const { data: folders } = queryContext.useFetchImageFolders();
    return (
        <ImageContextProvider foldersFromDb={folders}>
            <UploadContextProvider>
                <Images />
            </UploadContextProvider>
        </ImageContextProvider>
    )
}

export default ImagesController;