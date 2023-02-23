import React from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import { buildLoadingState, withLoading } from '../../components/hoc';
import { throttle } from '../../utils';
import { useFirebaseContext } from '../../components/firebase';

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

const ImageContext = React.createContext(null);

export const ImageContextProvider = withLoading(({foldersFromDb, children}) => {
    const firebaseContext = useFirebaseContext();
    const [ rows, setRows ] = React.useState({});
    const [ selectedItems, setSelectedItems ] = React.useState(new Set());
    const [ storageRef, setStorageRef ] = React.useState(firebaseContext.storageRef());
    const [ thumbs, setThumbs ] = React.useState(new Set());
    const [ errors, setErrors ] = React.useState(new Set());
    const thumbsRef = React.useRef(null);
    const destinationProps = React.useRef({
        year: null,
        title: null
    });

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

    const refreshThumbnails = React.useCallback(() => {
        if (thumbsRef.current === null || thumbsRef.current === undefined) {
            return firebaseContext.list(storageRef, { })
                .then(result => {
                    thumbsRef.current = result.prefixes.find(isThumbsFolder);
                    return setThumbsFromRef();
                });
        } else {
            return setThumbsFromRef();
        }
    }, [firebaseContext, storageRef, setThumbsFromRef]);

    const fetchItems = React.useCallback(() => {
        return firebaseContext.list(storageRef, { })
            .then(result => {
                const foldersFromStorage = result.prefixes.filter(isNotThumbsFolder);
                const missingFolders = getMissingStorageFolders(storageRef.fullPath, foldersFromStorage, foldersFromDb);
                thumbsRef.current = result.prefixes.find(isThumbsFolder);
                setRows({
                    folders: foldersFromStorage,
                    files: result.items.filter((item) => !firebaseContext.isGhostFile(item)),
                    missingFolders: missingFolders
                })
                return setThumbsFromRef();
            })
    }, [storageRef, firebaseContext, foldersFromDb, setThumbsFromRef]);

    React.useEffect(() => {
        fetchItems();
    }, [fetchItems])

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
            destinationProps.current = extractDestinationProps(bucketPath);
            setErrors(new Set());
            setRows({});
            setStorageRef(firebaseContext.storageRef(bucketPath));
            setSelectedItems(new Set());
        });
    }, [firebaseContext]);

    const onSelectAllClick = React.useCallback((event) => {
        let selection;
        if (event.target.checked) {
            selection = new Set([
                ...rows.files.map(item => item.fullPath),
                ...rows.folders.map(prefix => prefix.fullPath)
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
                newSelection.add(row.fullPath);
            } else {
                newSelection.delete(row.fullPath);
            }
            return newSelection;
        })
    }, []);

    const isSelected = React.useCallback((row) => {
        return selectedItems.has(row.fullPath);
    }, [selectedItems]);

    const createFolder = React.useCallback((folderName) => {
        return firebaseContext.createFolder(storageRef, folderName)
        .then(() => {
            return fetchItems();
        })
    }, [storageRef, firebaseContext, fetchItems]);

    const totalRows = (rows.files ? rows.files.length : 0) + (rows.folders ? rows.folders.length : 0);

    const imageContext = {
        ready: rows.missingFolders !== undefined && rows.files !== undefined && rows.folders !== undefined,
        rows,
        storageRef,
        onSetBucketPath,
        destinationProps: destinationProps.current,
        thumbs,
        fetchItems,
        setItemStatus,
        errors,
        onRowClick: handleOnRowClick,
        onSelectAll: onSelectAllClick,
        onUnselectAll: onUnselectAllClick,
        onRowSelected: onRowSelected,
        isSelected: isSelected,
        allSelected: selectedItems.size > 0 && selectedItems.size === totalRows,
        manySelected: selectedItems.size > 0 && selectedItems.size < totalRows,
        selectionCount: selectedItems.size,
        selection: () => Array.from(selectedItems),
        refreshThumbnails: throttle(refreshThumbnails, 1000, false /* leading */, true /* trailing */),
        createFolder: createFolder
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
