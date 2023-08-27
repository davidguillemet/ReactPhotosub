import React from 'react';
import { useUploadContext } from '../upload/UploadContext';
import { StorageItemStatus } from './StorageItemStatus';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import {
    STATUS_UNKNOWN,
    STATUS_PENDING,
    STATUS_NOT_AVAILABLE,
    STATUS_SUCCESS,
    STATUS_ERROR
} from './StorageItemStatus';
import { useImageContext } from '../ImageContext';
import { FOLDER_TYPE } from '../common';

const DatabaseStatus = ({row, onSetStatus}) => {

    const uploadContext = useUploadContext();
    const imageContext = useImageContext();

    const [ status, setStatus ] = React.useState({
        status: STATUS_UNKNOWN,
        message: ""
    })

    const onInsertImageInDatabase = React.useCallback(() => {
        const insertInDatabase = uploadContext.insertInDatabase;
        insertInDatabase(row.fullPath);
    }, [
        uploadContext.insertInDatabase,
        row
    ]);

    React.useEffect(() => {

        let messages = null;
        let status = null;

        const uploadContext_isDbProcessing = uploadContext.isDbProcessing;
        const uploadContext_hasDbProcessingError = uploadContext.hasDbProcessingError;
        const uploadContext_getDbProcessingError = uploadContext.getDbProcessingError;

        if (imageContext.folderType !== FOLDER_TYPE.destination) {
            // Image in database for destination only
            status = STATUS_NOT_AVAILABLE;
        } else if (uploadContext_isDbProcessing(row.fullPath)) {
            status = STATUS_PENDING;
        } else if (uploadContext_hasDbProcessingError(row.fullPath)) {
            const error = uploadContext_getDbProcessingError(row.fullPath);
            status = STATUS_ERROR;
            messages = [error];
        } else if (!row.name.endsWith(".jpg")) {
            // Not an image from a destination
            status = STATUS_NOT_AVAILABLE;
        } else {
            const imageContext_getImageFromDatabase = imageContext.getImageFromDatabase;
            const imageFromDb = imageContext_getImageFromDatabase(row.name);
            if (imageFromDb === null) {
                // The parent folder is not a destination
                status = STATUS_NOT_AVAILABLE;
            } else if (imageFromDb !== undefined) {
                // The current image is in database -> OK
                status = STATUS_SUCCESS; 
            } else {
                // The current image is not in database
                status = STATUS_ERROR;
                messages = ["L'image existe dans Storage mais pas en base"];
            }
        }

        onSetStatus(status);
        setStatus({
            status,
            messages
        });

    }, [
        uploadContext.isDbProcessing,
        uploadContext.hasDbProcessingError,
        uploadContext.getDbProcessingError,
        imageContext.getImageFromDatabase,
        imageContext.folderType,
        row,
        onSetStatus
    ]);

    return (
         <StorageItemStatus
            {...status}
            remediation={[{
                onFix: onInsertImageInDatabase,
                fixCaption: "Insérer l'image en base"
            }]}
            errorIcon={StorageOutlinedIcon}
        />
    )
};

export default DatabaseStatus;