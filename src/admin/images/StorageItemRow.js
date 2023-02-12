import React from 'react';
import { Box } from '@mui/system';
import { Chip, Link } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { useGlobalContext } from '../../components/globalContext';
import { ITEM_TYPE_FOLDER } from './common';
import { _thumbnailSpecs } from '../../utils';
import useImageContext from './ImageContextHook';
import {
    STATUS_ERROR,
    STATUS_NOT_AVAILABLE,
    STATUS_NOT_READY,
    STATUS_NO_THUMBS_FOLDER,
    STATUS_PENDING,
    STATUS_SUCCESS,
    getItemConsolidatedStatus,
    StorageItemStatus
 } from './StorageItemStatus';

const _retryBeforeMissing = 5;
const _retryTimeout = 1500;

const allThumbsCreated = (ref, thumbs, statusInfo) => {
    const itemFullName = ref.name; // "filename.jpg"
    const dotPosition = itemFullName.lastIndexOf(".");
    const fileExtension = itemFullName.substring(dotPosition);
    const itemName = itemFullName.substring(0, dotPosition);

    _thumbnailSpecs.forEach(thumbSpec => {
        const thumbnailFileName = `${itemName}_${thumbSpec.fileSuffix}${fileExtension}`;
        const thumbnailExists = thumbs.has(thumbnailFileName);
        if (!thumbnailExists) {
            if (statusInfo.missing === undefined) {
                statusInfo.missing = [];
            }
            statusInfo.missing.push(thumbSpec.fileSuffix);
        }
        return thumbnailExists;
    })
    return (statusInfo.missing === undefined);
}

const StorageItemRow = ({
    row,
    destinationProps,
    selected,
    type,
    thumbs,
    imagesFromDb,
    refetchThumbnails}) => {

    const context = useGlobalContext();
    const imageContext = useImageContext();

    const [ dbStatus, setDbStatus ] = React.useState({ status: STATUS_PENDING });
    const [ thumbStatus, setThumbStatus ] = React.useState({ status: STATUS_PENDING });
    const [ refreshingThumbs, setRefreshingThumbs ] = React.useState(false);
    const [ refreshingDatabase, setRefreshingDatabase ] = React.useState(false);

    const invalidateImageQueryTimeout = React.useRef(null);
    const invalidateImageQueryCount = React.useRef(0);
    const thumbnailsRetryTimeout = React.useRef(null);
    const thumbnailsRetryCount = React.useRef(0);

    const getThumbStatus = React.useCallback(() => {
        let message = null;
        let status = null;
        const statusInfo = {};
        if (type === ITEM_TYPE_FOLDER || !row.name.endsWith(".jpg")) {
            // Not an image from a destination
            status = STATUS_NOT_AVAILABLE;
        } else if (thumbs === null) {
            // The thumbs folder does not exist
            message = "Le répertoire des vignettes n'existe pas";
            status = STATUS_NO_THUMBS_FOLDER;
        } else if (allThumbsCreated(row, thumbs, statusInfo)) {
            // All thumbnails exist -> OK
            status = STATUS_SUCCESS;
        } else if (imageContext.isNewFile(row) === true) {
            // New uploaded file...wait a little bit
            status = STATUS_PENDING;
        } else {
            // Some thumbnails are missing
            if (statusInfo.missing !== undefined) {
                if (statusInfo.missing.length === _thumbnailSpecs.length) {
                    message = "Il manque toutes les vignettes";
                } else {
                    message = "Il manque les vignettes " + statusInfo.missing.join(", ");
                }
            } else {
                // Should not happen...
                message = "Il manque des vignettes";
            }
            status = STATUS_ERROR;
        }
        return {
            status,
            message
        }
    }, [imageContext, type, row, thumbs]);

    const getDbStatus = React.useCallback(() => {
        let message = null;
        let status = null;
        if (type === ITEM_TYPE_FOLDER || !row.name.endsWith(".jpg")) {
            // Not an image from a destination
            status = STATUS_NOT_AVAILABLE;
        } else if (imagesFromDb === null) {
            // The parent folder is not a destination
            status = STATUS_NOT_AVAILABLE;
        } else if (imagesFromDb === undefined) {
            // Images are loading
            status = STATUS_NOT_READY;
        } else if (imagesFromDb.findIndex(image => image.name === row.name) >= 0) {
            // The current image is in database -> OK
            status = STATUS_SUCCESS;
        } else if (imageContext.isNewFile(row) === true) {
            // New uploaded file...wait a little bit
            status = STATUS_PENDING;
        } else {
            // The current image is not in database
            status = STATUS_ERROR;
            message = "L'image existe dans Storage mais pas en base";
        }
        return {
            status,
            message
        }
    }, [imageContext, type, row, imagesFromDb]);

    const invalidateImageQuery = React.useCallback(() => {
        if (destinationProps !== null) {
            invalidateImageQueryTimeout.current = null;
            invalidateImageQueryCount.current++;
            context.clearDestinationImages(destinationProps.year, destinationProps.title);
        }
    }, [context, destinationProps]);

    React.useEffect(() => {
        const dbStatus = getDbStatus();
        const retryImageQuery =
            // In case the image is new, retry several times before considering an error
            (dbStatus.status === STATUS_PENDING && invalidateImageQueryCount.current < _retryBeforeMissing) ||
            // Just retry once in case the current image is missing
            (dbStatus.status === STATUS_ERROR && invalidateImageQueryCount.current < 1);

        if (retryImageQuery) {
            dbStatus.status = STATUS_PENDING; // In case the current status is ERROR
            if (invalidateImageQueryTimeout.current === null) {
                invalidateImageQueryTimeout.current = setTimeout(invalidateImageQuery, _retryTimeout);
            }
        } else if (dbStatus.status === STATUS_PENDING) {
            // We already tried enough times -> consider an error
            dbStatus.status = STATUS_ERROR;
            dbStatus.message = "L'image existe dans Storage mais pas en base";
        }

        if (refreshingDatabase === true) {
            // Refreshing database = Process image in Storage and insert image row in db
            dbStatus.status = STATUS_PENDING;
        }

        if (dbStatus.status !== STATUS_PENDING) {
            // In any other case than PENDING, we clear the retry count
            invalidateImageQueryCount.current = 0;
        }

        setDbStatus(dbStatus);

        return function cleanUpDatabaseTimeout () {
            if (invalidateImageQueryTimeout.current !== null) {
                clearTimeout(invalidateImageQueryTimeout.current);
                invalidateImageQueryTimeout.current = null;
            }
        }
    }, [getDbStatus, invalidateImageQuery, refreshingDatabase]);

    const onRefetchThumbnails = React.useCallback(() => {
        thumbnailsRetryTimeout.current = null;
        refetchThumbnails(true /* retry parameter */);
    }, [refetchThumbnails]);

    React.useEffect(() => {
        const thumbStatus = getThumbStatus();
        const retryThumbnails =
            (thumbStatus.status === STATUS_PENDING /*|| thumbStatus.status === STATUS_NO_THUMBS_FOLDER*/) &&
            thumbnailsRetryCount.current < _retryBeforeMissing;

        if (retryThumbnails) {
            thumbStatus.status = STATUS_PENDING;
            if (thumbnailsRetryTimeout.current === null) {
                thumbnailsRetryCount.current++;
                thumbnailsRetryTimeout.current = setTimeout(onRefetchThumbnails, _retryTimeout);
            }
        } else if (thumbStatus.status === STATUS_PENDING) {
            thumbStatus.status = STATUS_ERROR;
            thumbStatus.message = "Il manque des vignettes";
        }

        if (refreshingThumbs === true) {
            // Refreshing thumbnails
            thumbStatus.status = STATUS_PENDING;
        }

        if (thumbStatus.status !== STATUS_PENDING) {
            // In any other case than PENDING, we clear the retry count
            thumbnailsRetryCount.current = 0;
        }

        setThumbStatus(thumbStatus);

        return function cleanUpThumbsTimeout () {
            if (thumbnailsRetryTimeout.current !== null) {
                clearTimeout(thumbnailsRetryTimeout.current);
                thumbnailsRetryTimeout.current = null;
            }
        }
    }, [getThumbStatus, onRefetchThumbnails, refreshingThumbs]);

    const onChange = React.useCallback((event) => {
        imageContext.onRowSelected(row, event.target.checked);
    }, [imageContext, row]);

    const handleOnRowClick = React.useCallback(() => {
        imageContext.onRowClick(row);
    }, [imageContext, row]);

    const onFixThumbnails = React.useCallback(() => {
        setRefreshingThumbs(true);
        context.dataProvider.refreshThumbnails(row.fullPath)
        .then(() => {
            refetchThumbnails(true /* retry parameter */);
        }).finally(() => {
            setRefreshingThumbs(false);
        });
    }, [context, row, refetchThumbnails]);

    const onInsertImageInDatabase = React.useCallback(() => {
        setRefreshingDatabase(true);
        context.dataProvider.insertImageInDatabase(row.fullPath)
        .then(() => {
            invalidateImageQuery();
        }).finally(() => {
            setRefreshingDatabase(false);
        });
    }, [context, row, invalidateImageQuery]);

    const itemStatus = React.useMemo(
        () => getItemConsolidatedStatus([dbStatus.status, thumbStatus.status]),
        [dbStatus, thumbStatus]
    );

    if (imageContext.isNewFile(row) && itemStatus === STATUS_SUCCESS) {
        // New file is ok
        imageContext.onUploadedFileCompleted(row);
    }

    return (
        <TableRow
            hover
            role="checkbox"
            tabIndex={-1}
            key={row.name}
            selected={selected}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    checked={selected}
                    onChange={onChange}
                />
            </TableCell>
            <TableCell
                component="th"
                id={row.name}
                scope="row"
                padding="none"
            >
            
            {
                type === ITEM_TYPE_FOLDER ?
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <FolderOpenIcon sx={{mr: 1, ml: 2, opacity: 0.6}}></FolderOpenIcon>
                    <Link component="button" onClick={handleOnRowClick}>{row.name}</Link>
                </Box> :
                <Chip color={itemStatus} icon={<InsertPhotoIcon />} label={row.name} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            }
            </TableCell>
            <TableCell align="left">{row.size}</TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <StorageItemStatus {...thumbStatus} onFix={onFixThumbnails} fixCaption="Recréer les vignettes"/>
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <StorageItemStatus {...dbStatus} onFix={onInsertImageInDatabase} fixCaption="Insérer l'image en base" />
            </TableCell>
        </TableRow>
    )
}

export default StorageItemRow;
