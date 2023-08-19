import React from 'react';
import { ITEM_TYPE_FILE } from './common';
import StorageFileRow from './StorageFileRow';
import UploadStorageItemRow from './upload/UploadStorageItemRow';
import MissingStorageItemRow from './MissingStorageItemRow';
import { useImageContext } from './ImageContext';
import { useUploadContext } from './upload/UploadContext';

const TableFiles = () => {

    const imageContext = useImageContext();
    const uploadContext = useUploadContext();
    const [ missingStorageImages, setMissingStorageImages] = React.useState([]);

    React.useEffect(() => {
        // Remove missing items that are uploading
        const missingImagesFromDb = [];
        const isUploading = uploadContext.isUploading
        const getItemFullPath = imageContext.getItemFullPath
        for (const itemName of imageContext.rows.missingFilesFromDb) {
            if (!isUploading(getItemFullPath(itemName))) {
                missingImagesFromDb.push(itemName);
            }
        }

        const allMissingImagesSet = new Set(missingImagesFromDb);
        for (const itemName of imageContext.rows.missingFilesFromThumbs) {
            if (!isUploading(getItemFullPath(itemName))) {
                allMissingImagesSet.add(itemName);
            }
        }

        const allMissingImagesArray = Array.from(allMissingImagesSet).sort();
        setMissingStorageImages(allMissingImagesArray);
    }, [
        uploadContext.isUploading,
        imageContext.getItemFullPath,
        imageContext.rows.missingFilesFromThumbs,
        imageContext.rows.missingFilesFromDb
    ])

    const isUploading = uploadContext.isUploading;

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
            imageContext.rows.files
            .sort((f1, f2) => f1.name.localeCompare(f2.name))
            .map((file) => {
                const isItemSelected = imageContext.isSelected(file);
                const uploading = isUploading(file.fullPath);
                return uploading ?
                    <UploadStorageItemRow
                        key={file.name}
                        file={file}
                    /> :
                    <StorageFileRow
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
