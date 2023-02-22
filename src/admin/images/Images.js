import React from 'react';
import { Box } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { useGlobalContext } from '../../components/globalContext';
import MissingStorageFolders from './MissingStorageFolders';
import UploadTableRows from './UploadTableRows';
import { ImageContextProvider, useImageContext } from './ImageContext';
import { UploadContextProvider } from './UploadContext';
import TableFolders from './TableFolders';
import TableFiles from './TableFiles';
import TableToolbar from './toolbar/TableToolbar';
import { CircularProgress } from '@mui/material';

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'thumbStatus', label: 'Thumbnail Status' }, // Ok if all thumbnails have been created
  { id: 'dbStatus', label: 'Database Status' },     // Ok if the image exists in database
  { id: 'tags', label: 'Tags' }                     // Ok if the tags column is not null
];

const Images = () => {
    const imageContext = useImageContext();
    return (
        <React.Fragment>
        <TableContainer component={Paper} sx={{display: 'flex', flexDirection: 'column'}}>
            <TableToolbar />
            <Table sx={{ width: "100%" }} size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
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
                    <UploadTableRows />
                    {
                        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
                        imageContext.ready === true && 
                        <React.Fragment>
                            <MissingStorageFolders dbFolders={imageContext.rows.missingFolders} />
                            <TableFolders folders={imageContext.rows.folders} />
                            <TableFiles files={imageContext.rows.files} />
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