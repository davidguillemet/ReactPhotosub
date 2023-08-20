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
import { FOLDER_TYPE } from '../common';

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
        generateThumbnails(row.fullPath);
    }, [
        uploadContext.generateThumbnails,
        row
    ]);

    React.useEffect(() => {
        let message = null;
        let status = null;
        const statusInfo = {};

        const uploadContext_isThumbProcessing = uploadContext.isThumbProcessing;
        const uploadContext_hasThumbProcessingError = uploadContext.hasThumbProcessingError;
        const uploadContext_getThumbProcessingError = uploadContext.getThumbProcessingError;

        if (imageContext.folderType !== FOLDER_TYPE.destination && imageContext.folderType !== FOLDER_TYPE.interior) {
            // Thumbnails for destination and interiors only
            status = STATUS_NOT_AVAILABLE;
        } else if (uploadContext_isThumbProcessing(row.fullPath)) {
            status = STATUS_PENDING;
        } else if (uploadContext_hasThumbProcessingError(row.fullPath)) {
            const error = uploadContext_getThumbProcessingError(row.fullPath);
            status = STATUS_ERROR;
            message = error;
        } else if (!row.name.endsWith(".jpg")) {
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

        onSetStatus(status);
        setStatus({
            status,
            message
        });
    }, [
        uploadContext.isThumbProcessing,
        uploadContext.hasThumbProcessingError,
        uploadContext.getThumbProcessingError,
        imageContext.thumbs,
        imageContext.folderType,
        row,
        onSetStatus
    ]);

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