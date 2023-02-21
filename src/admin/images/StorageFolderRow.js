import React from 'react';
import { Box } from '@mui/system';
import { Link } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import RowSelector from './RowSelector';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useImageContext } from './ImageContext';

const StorageFolderRow = ({folder, selected}) => {

    const imageContext = useImageContext();

    const handleOnRowClick = React.useCallback(() => {
        const onRowClick = imageContext.onRowClick;
        onRowClick(folder);
    }, [imageContext.onRowClick, folder]);

    return (
        <TableRow
            hover
            role="checkbox"
            tabIndex={-1}
            key={folder.name}
            selected={selected}
        >
            <TableCell padding="checkbox">
                <RowSelector row={folder} selected={selected} />
            </TableCell>
            <TableCell
                component="th"
                id={folder.name}
                scope="row"
                padding="none"
            >
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0}}>
                    <FolderOpenIcon sx={{mr: 1, ml: 2, opacity: 0.6}}></FolderOpenIcon>
                    <Link component="button" onClick={handleOnRowClick}>{`${folder.name}/`}</Link>
                </Box>
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>{" - "}</TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>{" - "}</TableCell>
        </TableRow>
    )
}

export default StorageFolderRow;
