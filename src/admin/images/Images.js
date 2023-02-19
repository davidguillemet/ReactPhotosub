import React from 'react';
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

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  { id: 'thumbStatus', label: 'Thumbnail Status' }, // Ok if all thumbnails have been created
  { id: 'dbStatus', label: 'Database Status' },     // Ok if the image exists in database
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