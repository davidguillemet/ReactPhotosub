import React from 'react';
import { useGlobalContext } from '../../components/globalContext';
import { useFirebaseContext } from '../../components/firebase';
import { ITEM_TYPE_FILE } from './common';
import StorageItemRow from './StorageItemRow';
import MissingStorageItemRow from './MissingStorageItemRow';
import useImageContext from './ImageContextHook';

const useDestinationImages = ({year, title}) => {
    const context = useGlobalContext();
    const { data } = context.useFetchDestinationImages(year, title);
    if (year !== null && title !== null) {
        return data;
    } else {
        return null;
    }
}

const TableRows = ({
    rows,
    destinationProps = null,
    type, 
    thumbsRef = null}) => {

    const context = useGlobalContext();
    const firebaseContext = useFirebaseContext();
    const imageContext = useImageContext();

    const [ thumbs, setThumbs ] = React.useState(undefined);
    const [ imageProps, setImageProps ] = React.useState({
        year: null,
        title: null
    });
    const dbImages = useDestinationImages(imageProps);
    const [ missingImages, setMissingImages ] = React.useState([]);

    const fetchThumbnails = React.useCallback((retry) => {
        if (thumbsRef !== null && thumbsRef !== undefined) {
            firebaseContext.list(thumbsRef, { })
            .then(result => {
                // Not interested with prefixes in thumbs folder
                const thumbs = result.items;
                const thumbsSet = new Set(thumbs.map(ref => ref.name));
                setThumbs(thumbsSet);
            })
        } else if (retry && imageContext.refetchThumbsRef !== null) {
            imageContext.refreshThumbsRef();
        } else {
            setThumbs(null);
        }
    }, [thumbsRef, imageContext, firebaseContext]);

    React.useEffect(() => {
        fetchThumbnails(false);
    }, [fetchThumbnails]);

    React.useEffect(() => {
        if (type === ITEM_TYPE_FILE && destinationProps !== null) {
            setImageProps({
                year: destinationProps.year,
                title: destinationProps.title
            })
        } else {
            setImageProps({
                year: null,
                title: null
            })
        }
    }, [type, destinationProps, context]);

    React.useEffect(() => {
        if (dbImages !== null && dbImages !== undefined) {
            // Check if all images in DB are in Storage or at least being uploaded
            const missingStorageImages = dbImages.filter(dbImage => {
                return rows.findIndex(storageImage => storageImage.name === dbImage.name) === -1 &&
                       !imageContext.isUploading(`${dbImage.path}/${dbImage.name}`);
            });
            setMissingImages(missingStorageImages);
        } else {
            setMissingImages([]);
        }

    }, [imageContext, dbImages, rows]);

    if (dbImages === undefined || thumbs === undefined) {
        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
        return null;
    }

    return (
        <React.Fragment>
        {
            missingImages.map((image) => <MissingStorageItemRow key={image.name} item={image} type={ITEM_TYPE_FILE} />)
        }
        {
            rows.map((row) => {
                const isItemSelected = imageContext.isSelected(row);
                return <StorageItemRow
                            key={row.name}
                            row={row}
                            destinationProps={destinationProps}
                            selected={isItemSelected}
                            type={type}
                            thumbs={thumbs}
                            imagesFromDb={dbImages}
                            refetchThumbnails={fetchThumbnails}
                        />
            })
        }
        </React.Fragment>
    )
}

export default TableRows;
