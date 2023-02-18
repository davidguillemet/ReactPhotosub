import React from 'react';
import { Chip } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RowSelector from './RowSelector';
import DatabaseStatus from './itemStatus/DatabaseStatus';
import ThumbnailStatus from './itemStatus/ThumbnailStatus';
import { getItemConsolidatedStatus } from './itemStatus/StorageItemStatus';

const StorageFileRow = ({
    row,
    selected,
    thumbs,
    imagesFromDb}) => {

    const [ dbStatus, setDbStatus ] = React.useState("default");
    const [ thumbStatus, setThumbStatus ] = React.useState("default");
    const [ itemStatus, setItemStatus ] = React.useState("default")

    React.useEffect(() => {
        const consolidatedStatus = getItemConsolidatedStatus(dbStatus, thumbStatus);
        setItemStatus(consolidatedStatus);
    }, [dbStatus, thumbStatus]);

    return (
        <TableRow
            hover
            role="checkbox"
            tabIndex={-1}
            key={row.name}
            selected={selected}
        >
            <TableCell padding="checkbox">
                <RowSelector row={row} selected={selected} />
            </TableCell>
            <TableCell
                component="th"
                id={row.name}
                scope="row"
                padding="none"
            >
                <Chip color={itemStatus} icon={<InsertPhotoIcon />} label={row.name} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            </TableCell>
            <TableCell align="left">{row.size}</TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <ThumbnailStatus row={row} thumbs={thumbs} onSetStatus={setThumbStatus} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <DatabaseStatus row={row} imagesFromDb={imagesFromDb} onSetStatus={setDbStatus} />
            </TableCell>
        </TableRow>
    )
}

export default StorageFileRow;
