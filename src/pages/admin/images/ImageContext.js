import React from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import { buildLoadingState, withLoading } from 'components/hoc';
import { getFileNameFromFullPath, getThumbnailsFromImageName } from 'utils';
import { useFirebaseContext } from 'components/firebase';
import { useQueryContext } from 'components/queryContext';
import { getImageNameFromThumbnail } from 'utils';
import { useDataProvider } from 'components/dataProvider';
import { ITEM_TYPE_FILE, ITEM_TYPE_FOLDER } from './common';

const ImageContext = React.createContext(null);

const isNotThumbsFolder = (item) => item.name !== "thumbs";
const isThumbsFolder = (item) => item.name === "thumbs";

const _yearRegexp = /^[0-9]{4}$/i; 

const extractDestinationProps = (path) => {
    const pathItems = path.split("/");
    if (pathItems.length === 2) {
        const title = pathItems[pathItems.length - 1];
        const year = pathItems[pathItems.length - 2];
        if (_yearRegexp.test(year)) {
            return {
                year,
                title
            }
        }
    }
    return {
        year: null,
        title: null
    }
}

const getMissingStorageFolders = (currentPath, foldersFromStorage, foldersFromDb) => {
    // storage.fullPath = '2025/essai'  
    // storage.name = 'essai'
    // foldersFromStorage = [ 'toto1', 'toto2' ]
    // foldersFromDb = [ '2025/essai/toto2', '2025/essai/toto3', '2023/xxx', '2022/xxx' ]
    let subFoldersFromDb = foldersFromDb.map(f => f.path);

    // Remove current storage fullPath from db folders
    if (currentPath.length > 0) {
        subFoldersFromDb = subFoldersFromDb.filter(f => f.startsWith(currentPath + "/"));    // [ '2025/essai/toto2', '2025/essai/toto3' ]
        subFoldersFromDb = subFoldersFromDb.map(f => f.substr(currentPath.length + 1)); // [ 'toto2', 'toto3' ]
    }

    // Remove sub folders from remaining db folders
    subFoldersFromDb = subFoldersFromDb.map(f => f.split('/')[0]);
    subFoldersFromDb = subFoldersFromDb.filter(dbFolder => foldersFromStorage.findIndex(storageItem => dbFolder === storageItem.name) === -1); // [ 'toto3' ]
    return Array.from(new Set(subFoldersFromDb)).map(f => { return { name: f}});
}

const useDestinationImages = ({year, title}) => {
    const queryContext = useQueryContext();
    const { data } = queryContext.useFetchDestinationImages(year, title);
    if (year !== null && title !== null) {
        return data;
    } else {
        return null;
    }
}

const getMissingImagesVersusDatabase = (files, imagesFromDatabase) => {
    if (imagesFromDatabase !== null) {
        // Check if all images in DB are in Storage
        const missingStorageImages = imagesFromDatabase.filter(dbImage => {
            return files.findIndex(storageImage => storageImage.name === dbImage.name) === -1;
        });
        return missingStorageImages.map(image => image.name);
    } else {
        return null;
    }
};

const getMissingImagesVersusThumbnails = (files, thumbs) => {
    const imagesFromThumbs = new Set();
    // browse thumbs and check the original image exists
    for (const thumbName of thumbs) {
        // Thumb is like "DSC_4991_l.jpg", "DSC_4991_m.jpg", "DSC_4991_s.jpg", "DSC_4991_xs.jpg"
        const imageName = getImageNameFromThumbnail(thumbName);
        imagesFromThumbs.add(imageName);
    }
    const missingImages = Array.from(imagesFromThumbs).filter(imageName => {
        return files.findIndex(storageImage => storageImage.name === imageName) === -1;
    });
    return missingImages;
};

export const ImageContextProvider = withLoading(({foldersFromDb, children}) => {
    const firebaseContext = useFirebaseContext();
    const dataProvider = useDataProvider();
    const queryContext = useQueryContext();
    const [ rows, setRows ] = React.useState({});
    const [ selectedItems, setSelectedItems ] = React.useState(new Set());
    const [ storageRef, setStorageRef ] = React.useState(firebaseContext.storageRef());
    const [ thumbs, setThumbs ] = React.useState(null);
    const [ errors, setErrors ] = React.useState(new Set());
    const initialFetchCompleted = React.useRef(false);
    const thumbsRef = React.useRef(null);
    const destinationProps = React.useRef({
        year: null,
        title: null
    });

    // The images in database for the current destination folder
    const dbImages = useDestinationImages(destinationProps.current);

    const setThumbsFromRef = React.useCallback(() => {
        if (thumbsRef.current !== null && thumbsRef.current !== undefined) {
            return firebaseContext.list(thumbsRef.current, { })
                .then(result => {
                    // Not interested with prefixes in thumbs folder
                    const thumbs = result.items;
                    const thumbsSet = new Set(thumbs.map(ref => ref.name));
                    setThumbs(thumbsSet);
                });
        } else {
            return Promise.resolve().then(() => setThumbs(new Set()));
        }
    }, [firebaseContext]);

    const addStorageItems = React.useCallback((newItems, itemType) => {
        setRows(prevRows => {
            const propName = itemType === ITEM_TYPE_FILE ? "files" : "folders";
            // In case of duplicate, remove the previous and keep the new one that
            // contains the native file we use for the upload task
            const newSet = new Set(newItems.map(item => item.fullPath));
            const prevItemsWithoutNew = prevRows[propName].filter(item => !newSet.has(item.fullPath));
            return {
                ...prevRows,
                [propName]: [ ...prevItemsWithoutNew, ...newItems ]
            }
        });
    }, []);

    const removeStorageItems = React.useCallback((itemFullPaths, itemType) => {
        setRows(prevRows => {
            const propName = itemType === ITEM_TYPE_FILE ? "files" : "folders";
            const removeSet = new Set(itemFullPaths);
            const newItems = prevRows[propName].filter(item => !removeSet.has(item.fullPath));
            return {
                ...prevRows,
                [propName]: [ ...newItems ]
            }
        });
    }, []);

    const addThumbs = React.useCallback((newThumbs) => {
        setThumbs(prevThumbs => new Set([ ...prevThumbs, ...newThumbs]));
    }, []);

    const removeThumbs = React.useCallback((thumbsToRemove) => {
        setThumbs(prevThumbs => {
            const newSet = new Set(prevThumbs);
            thumbsToRemove.forEach(thumb => newSet.delete(thumb));
            return newSet;
        });
    }, []);

    const fetchItems = React.useCallback(() => {
        return firebaseContext.list(storageRef, { })
            .then(result => {
                const foldersFromStorage = result.prefixes.filter(isNotThumbsFolder);
                thumbsRef.current = result.prefixes.find(isThumbsFolder);
                const filesFromStorage = result.items
                    .filter((item) => !firebaseContext.isGhostFile(item))
                    .map(storageFile => {
                        return {
                            fullPath: storageFile.fullPath,
                            name: storageFile.name
                        }
                    });
                setRows({
                    folders: foldersFromStorage,
                    files: filesFromStorage,
                    missingFolders: undefined,
                    missingFilesFromThumbs: undefined, // Set: Thumbs exist but the storage item is missing
                    missingFilesFromDb: undefined // Set: Database entry exists while the storage item is missing
                })
                setErrors(new Set());
                setThumbs(null);
                return setThumbsFromRef();
            })
    }, [storageRef, firebaseContext, setThumbsFromRef]);

    React.useEffect(() => {
        // Initial fetch Items
        if (initialFetchCompleted.current === false) {
            fetchItems();
            initialFetchCompleted.current = true;
        }
    }, [fetchItems])

    React.useEffect(() => {
        if (rows.folders === undefined) {
            return;
        }
        setRows(prevRows => {
            const missingFolders = getMissingStorageFolders(storageRef.fullPath, prevRows.folders, foldersFromDb)
            return {
                ...prevRows,
                missingFolders: missingFolders
            }
        })
    }, [
        rows.folders,
        storageRef.fullPath,
        foldersFromDb
    ])

    React.useEffect(() => {
        if (dbImages === undefined || rows.files === undefined || thumbs === null) {
            return;
        }

        const missingImagesFromThumbs = new Set(getMissingImagesVersusThumbnails(rows.files, thumbs));
        const missingImagesFromDatabase = new Set(getMissingImagesVersusDatabase(rows.files, dbImages));

        setRows(prevRows => {
            return {
                ...prevRows,
                missingFilesFromThumbs: missingImagesFromThumbs,
                missingFilesFromDb: missingImagesFromDatabase,
            }
        });
    }, [thumbs, dbImages, rows.files])

    React.useEffect(() => {
        // When dbImages has been changed, for example after having removed an image for the current destination,
        // we have to check if it's empty, in which case we have to remove the current destination folder
        // from foldersFromDb
        if (dbImages !== undefined && dbImages !== null && dbImages.length === 0) {
            const queryContext_removeImageFolder = queryContext.removeImageFolder;
            const { year, title } = destinationProps.current;
            queryContext_removeImageFolder(year, title);
        }

    }, [dbImages, queryContext.removeImageFolder])

    const setItemStatus = React.useCallback((fullPath, status) => {
        setErrors(prevErrors => {
            const newErrors = new Set(prevErrors);
            if (status === "error") {
                newErrors.add(fullPath);
            } else {
                newErrors.delete(fullPath);
            }
            return newErrors;
        })
    }, []);

    const onSetBucketPath = React.useCallback((bucketPath) => {
        unstable_batchedUpdates(() => {
            initialFetchCompleted.current = false;
            destinationProps.current = extractDestinationProps(bucketPath);
            setRows({});
            setThumbs(null);
            setStorageRef(firebaseContext.storageRef(bucketPath));
            setSelectedItems(new Set());
        });
    }, [firebaseContext]);

    const onSelectAllClick = React.useCallback((event) => {
        let selection;
        if (event.target.checked) {
            selection = new Set([
                ...rows.files.map(item => item.name),
                ...rows.folders.map(prefix => prefix.name)
            ])
        } else {
            selection = new Set();
        }
        setSelectedItems(selection);
    }, [rows]);

    const onUnselectAllClick = React.useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    const handleOnRowClick = React.useCallback((row) => {
        const rowFullPath = row.fullPath;
        onSetBucketPath(rowFullPath);
    }, [onSetBucketPath]);

    const onRowSelected = React.useCallback((row, selected) => {
        setSelectedItems(prevSelection => {
            const newSelection = new Set(prevSelection);
            if (selected === true) {
                newSelection.add(row.name);
            } else {
                newSelection.delete(row.name);
            }
            return newSelection;
        })
    }, []);

    const isSelected = React.useCallback((row) => {
        return selectedItems.has(row.name);
    }, [selectedItems]);

    const getItemFullPath = React.useCallback((itemName) => {
        const root = storageRef.fullPath;
        if (root !== '') {
            return `${root}/${itemName}`;
        }
        return itemName;
    }, [storageRef.fullPath])

    const createFolder = React.useCallback((folderName) => {
        return firebaseContext.createFolder(storageRef, folderName)
        .then((folderRef) => {
            addStorageItems([folderRef], ITEM_TYPE_FOLDER);
        })
    }, [
        storageRef,
        firebaseContext,
        addStorageItems
    ]);

    const getImageFromDatabase = React.useCallback((imageName) => {
        if (dbImages === null) {
            return null;
        }
        if (dbImages === undefined) {
            // Should not happen
            throw new Error("Oups...la liste des images en base n'est pas définie...");
        }
        return dbImages.find(image => image.name === imageName);

    }, [dbImages]);

    const deleteThumbnails = React.useCallback((itemFullPath) => {
        const itemThumbnails = getThumbnailsFromImageName(itemFullPath);
        const thumbnailsToRemove = itemThumbnails.filter(thumbFullPath => thumbs.has(getFileNameFromFullPath(thumbFullPath)));
        const firebaseContext_deleteItems = firebaseContext.deleteItems;
        return firebaseContext_deleteItems(thumbnailsToRemove)
        .then(() => {
            removeThumbs(thumbnailsToRemove.map(fullPath => getFileNameFromFullPath(fullPath)));
        });
    }, [thumbs, firebaseContext.deleteItems, removeThumbs]);

    const deleteStorageItem = React.useCallback((itemFullPath, itemType) => {
        return dataProvider.removeStorageItem(itemFullPath)
        .then(() => {
            removeStorageItems([itemFullPath], itemType);
        });
    }, [dataProvider, removeStorageItems]);

    const deleteImageFromDatabase = React.useCallback((itemFullPath) => {
        return dataProvider.removeImageFromDatabase(itemFullPath)
        .then(() => {
            const { year, title } = destinationProps.current;
            const queryContext_removeDestinationImage = queryContext.removeDestinationImage;
            queryContext_removeDestinationImage(year, title, itemFullPath);
        });
    }, [
        dataProvider,
        queryContext.removeDestinationImage
    ]);

    const totalRows = (rows.files ? rows.files.length : 0) + (rows.folders ? rows.folders.length : 0);
    const isReady =
        dbImages !== undefined &&
        thumbs !== null &&
        rows.folders !== undefined &&
        rows.files !== undefined &&
        rows.missingFolders !== undefined &&
        rows.missingFilesFromThumbs !== undefined &&
        rows.missingFilesFromDb !== undefined;

    const imageContext = {
        // true is all information has been collected
        ready: isReady,

        // all items from current path including thumbnails
        rows,
        thumbs,
        itemCount: totalRows,

        // Information about the current path
        storageRef,
        getItemFullPath,
        onSetBucketPath,
        isRoot: storageRef.parent === null,
        folderName: storageRef.name,

        // Information about the possible current destination
        destinationProps: destinationProps.current,
        isDestinationFolder: destinationProps.current.year !== null && destinationProps.current.title !== null,

        // Methods to manage items/thumbnails
        createFolder,
        deleteThumbnails,
        deleteStorageItem,
        deleteImageFromDatabase,

        addStorageItems,
        removeStorageItems,
        addThumbs,

        // Get the database image row from the full path if it exists
        getImageFromDatabase,

        // Error handling
        setItemStatus,
        errors,

        // Click handlers (in practice = open a folder)
        onRowClick: handleOnRowClick,

        // Selection management
        onSelectAll: onSelectAllClick,
        onUnselectAll: onUnselectAllClick,
        onRowSelected: onRowSelected,
        isSelected: isSelected,
        allSelected: selectedItems.size > 0 && selectedItems.size === totalRows,
        manySelected: selectedItems.size > 0 && selectedItems.size < totalRows,
        selectionCount: selectedItems.size,
        selection: () => Array.from(selectedItems),
    };

    return (
        <ImageContext.Provider value={imageContext}>
          { children }
        </ImageContext.Provider>
    )
}, [buildLoadingState("foldersFromDb", [undefined])]);


export function useImageContext() {
    const context = React.useContext(ImageContext);
    if (context === undefined || context === null) {
        throw new Error("useImageContext must be used within an ImageContextProvider");
    }
    return context;
}
