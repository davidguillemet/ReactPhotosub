import React from 'react';
import { StorageItemStatus } from './StorageItemStatus';
import {
    STATUS_PENDING,
    STATUS_NOT_AVAILABLE,
    STATUS_SUCCESS,
    STATUS_ERROR
} from './StorageItemStatus';
import { _thumbnailSpecs } from 'utils';
import { useUploadContext } from '../upload/UploadContext';
import { useImageContext } from '../ImageContext';

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
            statusInfo.missing.push(thumbSpec.caption);
        }
        return thumbnailExists;
    })
    return (statusInfo.missing === undefined);
}

const ThumbnailStatus = ({row, onSetStatus}) => {
    const uploadContext = useUploadContext();
    const imageContext = useImageContext();

    const [ status, setStatus ] = React.useState({
        status: STATUS_PENDING,
        message: ""
    })

    const onFixThumbnails = React.useCallback(() => {
        const generateThumbnails = uploadContext.generateThumbnails;
        const refreshThumbnails = imageContext.refreshThumbnails;
        generateThumbnails(row.fullPath).then(() => refreshThumbnails());
        onSetStatus(STATUS_PENDING);
        setStatus({
            status: STATUS_PENDING,
            message: ""
        });
    }, [
        uploadContext.generateThumbnails,
        imageContext.refreshThumbnails,
        onSetStatus,
        row]);

    React.useEffect(() => {
        let message = null;
        let status = null;
        const statusInfo = {};
        
        if (!row.name.endsWith(".jpg")) {
            // Not an image from a destination
            status = STATUS_NOT_AVAILABLE;
        } else if (allThumbsCreated(row, imageContext.thumbs, statusInfo)) {
            // All thumbnails exist -> OK
            status = STATUS_SUCCESS;
        } else {
            // Some thumbnails are missing
            if (statusInfo.missing !== undefined) {
                if (statusInfo.missing.length === _thumbnailSpecs.length) {
                    message = "Il manque toutes les vignettes";
                } else {
                    message = "Il manque des vignettes: " + statusInfo.missing.join(", ");
                }
            } else {
                // Should not happen...
                message = "Il manque des vignettes";
            }
            status = STATUS_ERROR;
        }

        if (uploadContext.isThumbProcessing(row.fullPath)) {
            status = STATUS_PENDING;
        }

        onSetStatus(status);
        setStatus({
            status,
            message
        });
    }, [uploadContext, imageContext.thumbs, row, onSetStatus]);

    return (
        <StorageItemStatus
            {...status}
            remediation={[{
                onFix: onFixThumbnails,
                fixCaption: "Recréer les vignettes"
            }]}
        />
    );
};

export default ThumbnailStatus;