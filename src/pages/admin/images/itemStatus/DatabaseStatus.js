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

const DatabaseStatus = ({row, onSetStatus}) => {

    const uploadContext = useUploadContext();
    const imageContext = useImageContext();

    const [ status, setStatus ] = React.useState({
        status: STATUS_UNKNOWN,
        message: ""
    })

    const onInsertImageInDatabase = React.useCallback(() => {
        uploadContext.insertInDatabase(row.fullPath);
        onSetStatus(STATUS_PENDING);
        setStatus({
            status: STATUS_PENDING,
            message: ""
        });
    }, [uploadContext, row, onSetStatus]);

    React.useEffect(() => {

        let newMessage = null;
        let newStatus = null;
        
        if (!row.name.endsWith(".jpg")) {
            // Not an image from a destination
            newStatus = STATUS_NOT_AVAILABLE;
        } else {
            const imageFromDb = imageContext.getImageFromDatabase(row.name);
            if (imageFromDb === null) {
                // The parent folder is not a destination
                newStatus = STATUS_NOT_AVAILABLE;
            } else if (imageFromDb !== undefined) {
                // The current image is in database -> OK
                newStatus = STATUS_SUCCESS; 
            } else {
                // The current image is not in database
                newStatus = STATUS_ERROR;
                newMessage = "L'image existe dans Storage mais pas en base";
            }
        }

        if (uploadContext.isDbProcessing(row.fullPath)) {
            if (newStatus !== STATUS_SUCCESS) {
                newStatus = STATUS_PENDING;
            } else {
                uploadContext.onDbProcessingCompleted(row.fullPath);
            }
        }

        onSetStatus(newStatus);
        setStatus({
            status: newStatus,
            message: newMessage
        });

    }, [uploadContext, imageContext, row, onSetStatus]);

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