import React from 'react';
import { useDataProvider } from 'components/dataProvider';
import { useImageContext } from '../ImageContext';
import { useQueryContext } from 'components/queryContext';
import { getThumbnailsFromImageName, getFileNameFromFullPath } from 'utils';
import { FOLDER_TYPE, ITEM_TYPE_FILE, hasDatabaseImage, requireThumbnails } from '../common';

const _maxParallelUpload = 3;

const UploadContext = React.createContext(null);

const addMapElement = (map, key, value) => {
    return new Map(map.set(key, value))
}

const removeMapElement = (map, key) => {
    const newMap = new Map(map);
    newMap.delete(key);
    return newMap;
}

const addSetElement = (set, value) => {
    return new Set(set.add(value));
}

const removeSetElement = (set, value) => {
    const newSet = new Set(set);
    newSet.delete(value);
    return newSet;
}

export const UploadContextProvider = ({children}) => {

    const dataProvider = useDataProvider();
    const queryContext = useQueryContext();
    const imageContext = useImageContext();
    const [ filesToUpload, setFilesToUpload ] = React.useState([]);
    const [ processingStatus, setProcessingStatus ] = React.useState({
        dbProcessing: new Set(),
        thumbProcessing: new Set(),
        blurryProcessing: new Set(),
        dbProcessingErrors: new Map(),
        thumbProcessingErrors: new Map(),
        blurryProcessingErrors: new Map()
    })

    const setUploadSelection = React.useCallback((files) => {
        const getItemFullPath = imageContext.getItemFullPath;
        const fileWrappers = files.map((file, index) => {
            const fullPath = getItemFullPath(file.name);
            const fileWrapper = {
                name: file.name,
                folderPath: imageContext.folderPath,
                fullPath: fullPath,
                size: file.size,
                nativeFile: file
            };
            return fileWrapper;
        });
        setFilesToUpload(fileWrappers);
        const addStorageItems = imageContext.addStorageItems
        addStorageItems(fileWrappers, ITEM_TYPE_FILE);
    }, [
        imageContext.addStorageItems,
        imageContext.getItemFullPath,
        imageContext.folderPath
    ]);

    const insertInDatabase = React.useCallback((fileFullPath) => {
        if (!hasDatabaseImage(imageContext.folderType)) {
            return Promise.resolve();
        }
        setProcessingStatus(prevStatus => {
            return {
                ...prevStatus,
                dbProcessing: addSetElement(prevStatus.dbProcessing, fileFullPath),
                dbProcessingErrors: removeMapElement(prevStatus.dbProcessingErrors, fileFullPath)
            }
        });
        return dataProvider.insertImageInDatabase(fileFullPath)
            .then((newImage) => {
                queryContext.addDestinationImage(newImage);
                setProcessingStatus(prevStatus => {
                    return {
                        ...prevStatus,
                        dbProcessing: removeSetElement(prevStatus.dbProcessing, fileFullPath)
                    }
                });
            }).catch((e) => {
                setProcessingStatus(prevStatus => {
                    return {
                        ...prevStatus,
                        dbProcessing: removeSetElement(prevStatus.dbProcessing, fileFullPath),
                        dbProcessingErrors: addMapElement(prevStatus.dbProcessingErrors, fileFullPath, e.message)
                    }
                })
            });
    }, [
        dataProvider,
        imageContext.folderType,
        queryContext
    ]);

    const generateThumbnails = React.useCallback((fileFullPath) => {
        if (!requireThumbnails(imageContext.folderType)) {
            return Promise.resolve();
        }

        setProcessingStatus(prevStatus => {
            return {
                ...prevStatus,
                thumbProcessing: addSetElement(prevStatus.thumbProcessing, fileFullPath),
                thumbProcessingErrors: removeMapElement(prevStatus.thumbProcessingErrors, fileFullPath)
            }
        })
        const thumbPromise =
            imageContext.folderType === FOLDER_TYPE.destination ?
            dataProvider.refreshThumbnails :        // Destination
            dataProvider.createInteriorThumbnails;  // Interior/homeslideshow/etc

        return thumbPromise.bind(dataProvider)(fileFullPath).then(() => {

            // Add thumbnails in imageContext
            const itemThumbnails = 
                getThumbnailsFromImageName(fileFullPath)
                .map(thumbFullPath => getFileNameFromFullPath(thumbFullPath));

            const addThumbs = imageContext.addThumbs;
            addThumbs(itemThumbnails);

            setProcessingStatus(prevStatus => {
                return {
                    ...prevStatus,
                    thumbProcessing: removeSetElement(prevStatus.thumbProcessing, fileFullPath)
                }
            })
        }).catch((e) => {
            setProcessingStatus(prevStatus => {
                return {
                    ...prevStatus,
                    thumbProcessing: removeSetElement(prevStatus.thumbProcessing, fileFullPath),
                    thumbProcessingErrors: addMapElement(prevStatus.thumbProcessingErrors, fileFullPath, e.message)
                }
            })
        });
    }, [
        dataProvider,
        imageContext.folderType,
        imageContext.addThumbs
    ]);

    const postProcessUploadedFile = React.useCallback((fileFullPath) => {
        const thumbPromise = generateThumbnails(fileFullPath);
        const dataBasePromise = insertInDatabase(fileFullPath);
        Promise.all([thumbPromise, dataBasePromise]).then((results) => {
            setFilesToUpload(files => files.filter(f => f.fullPath !== fileFullPath));
        }); // catch is managed in generateThumbnails & insertInDatabase
    }, [generateThumbnails, insertInDatabase]);

    const onUploadFileError = React.useCallback((fileFullPath) => {
        // Remove error files from the queue
        // -> If we do that, the upload error is not displayed and the item is considered as uploaded...
        // setFilesToUpload(files => files.filter(f => f.fullPath !== fileFullPath));
    }, []);

    const canStartUpload = React.useCallback((fileFullPath) => {
        const fileIndex = filesToUpload.findIndex(fileToUpload => fileToUpload.fullPath === fileFullPath);
        return (fileIndex < _maxParallelUpload);
    }, [filesToUpload]);

    const isUploading = React.useCallback((fullPath) => {
        return filesToUpload.some(fileToUpload => fileToUpload.fullPath === fullPath)
    }, [filesToUpload]);

    const isDbProcessing = React.useCallback((fullPath) => {
        return processingStatus.dbProcessing.has(fullPath);
    }, [processingStatus.dbProcessing]);

    const hasDbProcessingError = React.useCallback((fullPath) => {
        return processingStatus.dbProcessingErrors.has(fullPath);
    }, [processingStatus.dbProcessingErrors]);

    const getDbProcessingError = React.useCallback((fullPath) => {
        if (processingStatus.dbProcessingErrors.has(fullPath)) {
            return processingStatus.dbProcessingErrors.get(fullPath);
        }
        return null;
    }, [processingStatus.dbProcessingErrors]);

    const isThumbProcessing = React.useCallback((fullPath) => {
        return processingStatus.thumbProcessing.has(fullPath);
    }, [processingStatus.thumbProcessing]);

    const hasThumbProcessingError = React.useCallback((fullPath) => {
        return processingStatus.thumbProcessingErrors.has(fullPath);
    }, [processingStatus.thumbProcessingErrors]);

    const getThumbProcessingError = React.useCallback((fullPath) => {
        if (processingStatus.thumbProcessingErrors.has(fullPath)) {
            return processingStatus.thumbProcessingErrors.get(fullPath);
        }
        return null;
    }, [processingStatus.thumbProcessingErrors]);

    const uploadContext = {
        setUploadSelection,
        canStartUpload,
        postProcessUploadedFile,
        onUploadFileError,
        generateThumbnails,
        insertInDatabase,
        isUploading,
        isDbProcessing,
        hasDbProcessingError,
        getDbProcessingError,
        isThumbProcessing,
        hasThumbProcessingError,
        getThumbProcessingError
    };

    return (
        <UploadContext.Provider value={uploadContext}>
          { children }
        </UploadContext.Provider>
    )
}

export const useUploadContext = () => React.useContext(UploadContext)