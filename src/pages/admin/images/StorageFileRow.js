import React from 'react';
import { Chip, Collapse, IconButton } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RowSelector from './RowSelector';
import DatabaseStatus from './itemStatus/DatabaseStatus';
import ThumbnailStatus from './itemStatus/ThumbnailStatus';
import { getItemConsolidatedStatus } from './itemStatus/StorageItemStatus';
import DataBasePropStatus from './itemStatus/DataBasePropStatus';
import { useImageContext } from './ImageContext';
import { containsImage } from './common';
import ImagePreview from './preview/ImagePreview';

const FileDetails = ({image, file, expanded}) => {
    const imageContext = useImageContext();

    if (!containsImage(imageContext.folderType)) {
        return null;
    }

    return (
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <ImagePreview image={image} file={file} />
                </Collapse>
            </TableCell>
        </TableRow>
    )
}

const StorageFileRow = ({row, selected}) => {

    const imageContext = useImageContext();

    const [ dbStatus, setDbStatus ] = React.useState("default");
    const [ thumbStatus, setThumbStatus ] = React.useState("default");
    const [ dbPropStatus, setDbPropStatus ] = React.useState("default");
    const [ itemStatus, setItemStatus ] = React.useState("default")

    const [ expanded, setExpanded ]  = React.useState(false);

    const toggleExpanded = React.useCallback(() => {
        setExpanded(prevExpanded => !prevExpanded);
    }, []);

    React.useEffect(() => {
        const consolidatedStatus = getItemConsolidatedStatus(dbStatus, thumbStatus, dbPropStatus);
        const setContextItemStatus = imageContext.setItemStatus;
        setContextItemStatus(row.name, consolidatedStatus);
        setItemStatus(consolidatedStatus);
    }, [row, dbStatus, thumbStatus, dbPropStatus, imageContext.setItemStatus]);

    const imageFromDb = imageContext.getImageFromDatabase(row.name);
    const hasThumbs = thumbStatus === "success";
    const displayed = imageContext.displayStatus(itemStatus);

    if (displayed === false) {
        return null;
    }

    return (
        <React.Fragment>
        <TableRow
            hover
            role="checkbox"
            tabIndex={-1}
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
                {
                    <IconButton
                        size="small"
                        onClick={toggleExpanded}
                        disabled={hasThumbs === false}
                    >
                        {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                }
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <ThumbnailStatus row={row} onSetStatus={setThumbStatus} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <DatabaseStatus row={row} onSetStatus={setDbStatus} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <DataBasePropStatus name={row.name} fullPath={row.fullPath} onSetStatus={setDbPropStatus} />
            </TableCell>
        </TableRow>
        {
            hasThumbs && <FileDetails image={imageFromDb} file={row} expanded={expanded} />
        }
        </React.Fragment>
    )
}

export default StorageFileRow;
