import React from 'react';
import { ITEM_TYPE_FILE } from './common';
import StorageFileRow from './StorageFileRow';
import MissingStorageItemRow from './MissingStorageItemRow';
import { useImageContext } from './ImageContext';
import { useUploadContext } from './upload/UploadContext';

const TableFiles = () => {

    const imageContext = useImageContext();
    const uploadContext = useUploadContext();
    const [ missingStorageImages, setMissingStorageImages] = React.useState([]);

    React.useEffect(() => {
        const isUploading = uploadContext.isUploading;
        // Remove missing items that are uploading
        const missingImagesFromDb = [];
        for (const itemName of imageContext.rows.missingFilesFromDb) {
            if (!isUploading(`${imageContext.bucketPath}/${itemName}`)) {
                missingImagesFromDb.push(itemName);
            }
        }

        const allMissingImagesSet = new Set(missingImagesFromDb);
        for (const itemName of imageContext.rows.missingFilesFromThumbs) {
            if (!isUploading(`${imageContext.bucketPath}/${itemName}`)) {
                allMissingImagesSet.add(itemName);
            }
        }

        const allMissingImagesArray = Array.from(allMissingImagesSet).sort();
        setMissingStorageImages(allMissingImagesArray);
    }, [
        uploadContext.isUploading,
        imageContext.bucketPath,
        imageContext.rows.missingFilesFromThumbs,
        imageContext.rows.missingFilesFromDb
    ])

    return (
        <React.Fragment>
        {
            missingStorageImages.sort().map((image) => {
                return <MissingStorageItemRow
                            key={image}
                            itemName={image}
                            type={ITEM_TYPE_FILE}
                            dbIssue={imageContext.rows.missingFilesFromDb.has(image)}
                            thumbIssue={imageContext.rows.missingFilesFromThumbs.has(image)}
                        />
            })
        }
        {
            imageContext.rows.files.map((file) => {
                const isItemSelected = imageContext.isSelected(file);
                return <StorageFileRow
                            key={file.name}
                            row={file}
                            selected={isItemSelected}
                            type={ITEM_TYPE_FILE}
                        />
            })
        }
        </React.Fragment>
    )
}

export default TableFiles;
