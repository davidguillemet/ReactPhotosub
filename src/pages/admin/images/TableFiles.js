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
        for (const item of imageContext.rows.missingFilesFromDb) {
            if (!isUploading(getItemFullPath(item.name))) {
                missingImagesFromDb.push(item);
            }
        }

        //const allMissingImagesSet = new Set(missingImagesFromDb);
        const allMissingImages = missingImagesFromDb; // We keep the array structure since we need the portfolio info for the status

        // We should never have missing files from thumbs since we are now using imageKit which does not create thumbnails,
        // but we keep this code in case of future changes
        // for (const itemName of imageContext.rows.missingFilesFromThumbs) {
        //     if (!isUploading(getItemFullPath(itemName))) {
        //         allMissingImagesSet.add(itemName);
        //     }
        // }

        //const allMissingImagesArray = Array.from(allMissingImagesSet).sort();
        // setMissingStorageImages(allMissingImagesArray);
        setMissingStorageImages(allMissingImages);
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
            missingStorageImages.sort((i1, i2) => i1.name.localeCompare(i2.name)).map((image) => {
                return <MissingStorageItemRow
                            key={image.name}
                            item={image}
                            type={ITEM_TYPE_FILE}
                            dbIssue={imageContext.rows.missingFilesFromDb.find((f) => f.name === image.name)}
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
