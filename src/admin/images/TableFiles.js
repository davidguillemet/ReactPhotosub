import React from 'react';
import { useGlobalContext } from '../../components/globalContext';
import { ITEM_TYPE_FILE } from './common';
import StorageFileRow from './StorageFileRow';
import MissingStorageItemRow from './MissingStorageItemRow';
import { useImageContext } from './ImageContext';
import { useUploadContext } from './UploadContext';

const useDestinationImages = ({year, title}) => {
    const context = useGlobalContext();
    const { data } = context.useFetchDestinationImages(year, title);
    if (year !== null && title !== null) {
        return data;
    } else {
        return null;
    }
}

const TableFiles = ({files}) => {

    const imageContext = useImageContext();
    const uploadContext = useUploadContext();
    const [ missingImages, setMissingImages ] = React.useState([]);

    const dbImages = useDestinationImages(imageContext.destinationProps);

    React.useEffect(() => {
        if (dbImages !== null && dbImages !== undefined) {
            // Check if all images in DB are in Storage or at least being uploaded
            const missingStorageImages = dbImages.filter(dbImage => {
                return files.findIndex(storageImage => storageImage.name === dbImage.name) === -1 &&
                       !uploadContext.isUploading(`${dbImage.path}/${dbImage.name}`);
            });
            setMissingImages(missingStorageImages);
        } else {
            setMissingImages([]);
        }

    }, [uploadContext, files, dbImages]);

    if (dbImages === undefined || imageContext.thumbs === undefined) {
        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
        return null;
    }

    return (
        <React.Fragment>
        {
            missingImages.map((image) => <MissingStorageItemRow key={image.name} item={image} type={ITEM_TYPE_FILE} />)
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
