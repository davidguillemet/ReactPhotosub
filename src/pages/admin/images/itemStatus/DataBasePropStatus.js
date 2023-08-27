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
import { GlobalImageErrors } from 'common/GlobalErrors';

const getStatus = (image) => {
    let status = STATUS_SUCCESS;
    const messages = [];

    GlobalImageErrors.forEach(errorType => {
        if (errorType.hasError(image)) {
            status = STATUS_ERROR;
            messages.push(errorType.getErrorMessage(image));
        }
    });

    return [
        status,
        messages
    ];
}

const DataBasePropStatus = ({name, fullPath, onSetStatus}) => {
    const uploadContext = useUploadContext();
    const imageContext = useImageContext();

    const [ status, setStatus ] = React.useState({
        status: STATUS_UNKNOWN,
        messages: null
    })

    React.useEffect(() => {

        let messages = null;
        let status = null;

        const uploadContext_isDbProcessing = uploadContext.isDbProcessing;
        if (uploadContext_isDbProcessing(fullPath)) {
            status = STATUS_PENDING;
        } else if (!name.endsWith(".jpg")) {
            // Not an image from a destination
            status = STATUS_NOT_AVAILABLE;
        } else {
            const imageContext_getImageFromDatabase = imageContext.getImageFromDatabase;
            const imageFromDb = imageContext_getImageFromDatabase(name);
            if (imageFromDb === null) {
                // The parent folder is not a destination
                status = STATUS_NOT_AVAILABLE;
            } else if (imageFromDb !== undefined) {
                [ status, messages ] = getStatus(imageFromDb);
            } else {
                // The current image is not in database
                // DatabaseStatus will display the status message
                status = STATUS_NOT_AVAILABLE;
            }
        }

        if (onSetStatus) {
            onSetStatus(status);
        }
        setStatus({
            status,
            messages
        });

    }, [
        uploadContext.isDbProcessing,
        imageContext.getImageFromDatabase,
        imageContext,
        fullPath,
        name,
        onSetStatus]);

    return <StorageItemStatus {...status} />;
}

export default DataBasePropStatus;