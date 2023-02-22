import React from 'react';
import {
    StorageItemStatus,
    STATUS_UNKNOWN,
    STATUS_PENDING,
    STATUS_NOT_AVAILABLE,
    STATUS_NOT_READY,
    STATUS_SUCCESS,
    STATUS_ERROR
} from './StorageItemStatus';
import { useUploadContext } from '../UploadContext';

const TagStatus = ({row, imagesFromDb, onSetStatus}) => {
    const uploadContext = useUploadContext();
    const [ status, setStatus ] = React.useState({
        status: STATUS_UNKNOWN,
        message: ""
    })

    React.useEffect(() => {

        let newMessage = null;
        let newStatus = null;
        
        if (!row.name.endsWith(".jpg")) {
            // Not an image from a destination
            newStatus = STATUS_NOT_AVAILABLE;
        } else if (imagesFromDb === null) {
            // The parent folder is not a destination
            newStatus = STATUS_NOT_AVAILABLE;
        } else if (imagesFromDb === undefined) {
            // Images are loading
            newStatus = STATUS_NOT_READY;
        } else if (imagesFromDb.findIndex(image => image.name === row.name) >= 0) {
            // The current image is in database, check tags
            if (row.tags !== null) {
                newStatus = STATUS_SUCCESS;
            } else {
                newStatus = STATUS_ERROR;
                newMessage = "L'image n'a pas de tags...";
            }
        } else {
            // The current image is not in database
            // DatabaseStatus will display the status message
            newStatus = STATUS_NOT_AVAILABLE;
        }

        if (uploadContext.isDbProcessing(row.fullPath)) {
            if (newStatus !== STATUS_SUCCESS) {
                newStatus = STATUS_PENDING;
            }
        }

        onSetStatus(newStatus);
        setStatus({
            status: newStatus,
            message: newMessage
        });

    }, [uploadContext, row, imagesFromDb, onSetStatus]);

    return <StorageItemStatus {...status} />;
}

export default TagStatus;