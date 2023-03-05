import React from 'react';
import { Chip } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RowSelector from './RowSelector';
import DatabaseStatus from './itemStatus/DatabaseStatus';
import ThumbnailStatus from './itemStatus/ThumbnailStatus';
import { getItemConsolidatedStatus } from './itemStatus/StorageItemStatus';
import TagStatus from './itemStatus/TagStatus';
import { useImageContext } from './ImageContext';

const StorageFileRow = ({row, selected}) => {

    const imageContext = useImageContext();

    const [ dbStatus, setDbStatus ] = React.useState("default");
    const [ thumbStatus, setThumbStatus ] = React.useState("default");
    const [ tagStatus, setTagStatus ] = React.useState("default");
    const [ itemStatus, setItemStatus ] = React.useState("default")

    React.useEffect(() => {
        const consolidatedStatus = getItemConsolidatedStatus(dbStatus, thumbStatus, tagStatus);
        const setContextItemStatus = imageContext.setItemStatus;
        setContextItemStatus(row.name, consolidatedStatus);
        setItemStatus(consolidatedStatus);
    }, [row, dbStatus, thumbStatus, tagStatus, imageContext.setItemStatus]);

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
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <ThumbnailStatus row={row} onSetStatus={setThumbStatus} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <DatabaseStatus row={row} onSetStatus={setDbStatus} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <TagStatus row={row} onSetStatus={setTagStatus} />
            </TableCell>
        </TableRow>
    )
}

export default StorageFileRow;
