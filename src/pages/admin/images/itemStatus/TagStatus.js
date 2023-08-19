import React from 'react';
import {
    StorageItemStatus,
    STATUS_UNKNOWN,
    STATUS_PENDING,
    STATUS_NOT_AVAILABLE,
    STATUS_SUCCESS,
    STATUS_ERROR
} from './StorageItemStatus';
import { useUploadContext } from '../upload/UploadContext';
import { useImageContext } from '../ImageContext';

const TagStatus = ({row, onSetStatus}) => {
    const uploadContext = useUploadContext();
    const imageContext = useImageContext();

    const [ status, setStatus ] = React.useState({
        status: STATUS_UNKNOWN,
        message: ""
    })

    React.useEffect(() => {

        let newMessage = null;
        let newStatus = null;

        const uploadContext_isDbProcessing = uploadContext.isDbProcessing;
        if (uploadContext_isDbProcessing(row.fullPath)) {
            newStatus = STATUS_PENDING;
        } else if (!row.name.endsWith(".jpg")) {
            // Not an image from a destination
            newStatus = STATUS_NOT_AVAILABLE;
        } else {
            const imageContext_getImageFromDatabase = imageContext.getImageFromDatabase;
            const imageFromDb = imageContext_getImageFromDatabase(row.name);
            if (imageFromDb === null) {
                // The parent folder is not a destination
                newStatus = STATUS_NOT_AVAILABLE;
            } else if (imageFromDb !== undefined) {
                // The current image is in database, check tags
                if (imageFromDb.tags !== null) {
                    newStatus = STATUS_SUCCESS;
                } else {
                    newStatus = STATUS_ERROR;
                    newMessage = "L'image n'a pas de tags en base...";
                }
            } else {
                // The current image is not in database
                // DatabaseStatus will display the status message
                newStatus = STATUS_NOT_AVAILABLE;
            }
        }

        onSetStatus(newStatus);
        setStatus({
            status: newStatus,
            message: newMessage
        });

    }, [
        uploadContext.isDbProcessing,
        imageContext.getImageFromDatabase,
        imageContext,
        row,
        onSetStatus]);

    return <StorageItemStatus {...status} />;
}

export default TagStatus;