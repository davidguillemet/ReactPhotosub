import React from 'react';
import { useQueryContext } from 'components/queryContext';
import { ITEM_TYPE_FILE } from './common';
import StorageFileRow from './StorageFileRow';
import MissingStorageItemRow from './MissingStorageItemRow';
import { useImageContext } from './ImageContext';
import { useUploadContext } from './UploadContext';
import { getImageNameFromThumbnail } from 'utils';

const useDestinationImages = ({year, title}) => {
    const queryContext = useQueryContext();
    const { data } = queryContext.useFetchDestinationImages(year, title);
    if (year !== null && title !== null) {
        return data;
    } else {
        return null;
    }
}

const TableFiles = ({files}) => {

    const imageContext = useImageContext();
    const uploadContext = useUploadContext();
    const [ missingStorageImages, setMissingStorageImages] = React.useState([]);
    const missingImagesVsDatabase = React.useRef(null);
    const missingImagesVsThumbs = React.useRef(null);

    const dbImages = useDestinationImages(imageContext.destinationProps);

    const getMissingImagesVersusDatabase = React.useCallback(() => {
        if (dbImages !== null && dbImages !== undefined) {
            const isUploading = uploadContext.isUploading;
            // Check if all images in DB are in Storage or at least being uploaded
            const missingStorageImages = dbImages.filter(dbImage => {
                return files.findIndex(storageImage => storageImage.name === dbImage.name) === -1 &&
                       !isUploading(`${dbImage.path}/${dbImage.name}`);
            });
            return missingStorageImages.map(image => image.name);
        } else {
            return null;
        }
    }, [uploadContext.isUploading, files, dbImages]);

    const getMissingImagesVersusThumbnails = React.useCallback(() => {
        if (imageContext.thumbs !== undefined) {
            const imagesFromThumbs = new Set();
            // browse thumbs and check the original image exists
            for (const thumbName of imageContext.thumbs) {
                // Thumb is like "DSC_4991_l.jpg", "DSC_4991_m.jpg", "DSC_4991_s.jpg", "DSC_4991_xs.jpg"
                const imageName = getImageNameFromThumbnail(thumbName);
                imagesFromThumbs.add(imageName);
            }
            const isUploading = uploadContext.isUploading;
            const missingImages = Array.from(imagesFromThumbs).filter(imageName => {
                return files.findIndex(storageImage => storageImage.name === imageName) === -1 &&
                       !isUploading(`${imageContext.storageRef.fullPath}/${imageName}`);
            });
            return missingImages;
        } else {
            return null;
        }
    }, [imageContext.thumbs, imageContext.storageRef, uploadContext.isUploading, files])

    React.useEffect(() => {
        missingImagesVsThumbs.current = new Set(getMissingImagesVersusThumbnails());
        missingImagesVsDatabase.current = new Set(getMissingImagesVersusDatabase());

        const allMissingImagesSet = new Set(missingImagesVsDatabase.current);
        if (missingImagesVsThumbs.current !== null) {
            for (const item of missingImagesVsThumbs.current) {
                allMissingImagesSet.add(item);
            }
        }

        const allMissingImagesArray = Array.from(allMissingImagesSet).sort();
        setMissingStorageImages(allMissingImagesArray);
    }, [imageContext.thumbs, dbImages, getMissingImagesVersusDatabase, getMissingImagesVersusThumbnails])

    if (dbImages === undefined || imageContext.thumbs === undefined) {
        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
        return null;
    }

    return (
        <React.Fragment>
        {
            missingStorageImages.sort().map((image) => {
                return <MissingStorageItemRow
                            key={image}
                            itemName={image}
                            type={ITEM_TYPE_FILE}
                            dbIssue={missingImagesVsDatabase.current.has(image)}
                            thumbIssue={missingImagesVsThumbs.current.has(image)}
                        />
            })
        }
        {
            files.map((file) => {
                const isItemSelected = imageContext.isSelected(file);
                return <StorageFileRow
                            key={file.name}
                            row={file}
                            selected={isItemSelected}
                            type={ITEM_TYPE_FILE}
                            thumbs={imageContext.thumbs}
                            imagesFromDb={dbImages}
                        />
            })
        }
        </React.Fragment>
    )
}

export default TableFiles;
