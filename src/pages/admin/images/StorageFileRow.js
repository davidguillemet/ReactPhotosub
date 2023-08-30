import React from 'react';
import { Chip, Collapse, Stack, IconButton, Box, Alert} from '@mui/material';
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
import LazyImage from 'components/lazyImage';
import { Body } from 'template/pageTypography';
import { containsImage } from './common';
import { useFirebaseContext } from 'components/firebase';

const ImageDetails = ({image}) => {
    if (!image) {
        return null;
    }
    return (
        <Stack
            direction={'column'}
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={0}
            sx={{marginX: 1, p: 0}}
        >
            {
                image.title ?
                <Body sx={{m: 0}}>{image.title}</Body> :
                <Alert severity='warning'>Pas de titre</Alert>
            }
            {
                image.description ?
                <Body sx={{m: 0}}>{image.description}</Body> :
                <Alert severity='warning'>Pas de description</Alert>
            }
            <Box>
                {
                    image.tags === null ?
                    <Alert severity='warning'>Pas de tags...</Alert> :
                    image.tags.map(tag => {
                        return (
                            <Chip key={tag} label={tag} size="small" sx={{marginRight: 0.5, marginTop: 0.5}} />
                        )
                    })
                }
            </Box>
        </Stack>
    )
}

const FileDetails = ({image, file, expanded}) => {
    const imageContext = useImageContext();
    const firebaseContext = useFirebaseContext();

    if (!containsImage(imageContext.folderType)) {
        return null;
    }
    if (!image) {
        file.src = `${firebaseContext.rootPublicUrl}/${file.fullPath}`;
    }
    const sxProp = {
        width: '200px'
    }
    if (image) {
        sxProp.height = `${200/image.sizeRatio}px`;
    }
    return (
        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Stack direction={'row'} sx={{p: 1}}>
                        <Box sx={sxProp}>
                            <LazyImage
                                image={image || file}
                                width={200}
                                withFavorite={false}
                                withOverlay={false}
                            />
                         </Box>
                         <ImageDetails image={image} />
                    </Stack>
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
