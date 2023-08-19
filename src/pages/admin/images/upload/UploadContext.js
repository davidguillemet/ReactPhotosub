import React from 'react';
import { useDataProvider } from 'components/dataProvider';
import { useImageContext } from '../ImageContext';
import { useQueryContext } from 'components/queryContext';
import { getThumbnailsFromImageName, getFileNameFromFullPath } from 'utils';
import { ITEM_TYPE_FILE } from '../common';

const _maxParallelUpload = 3;

const UploadContext = React.createContext(null);

export const UploadContextProvider = ({children}) => {

    const dataProvider = useDataProvider();
    const queryContext = useQueryContext();
    const imageContext = useImageContext();
    const [ filesToUpload, setFilesToUpload ] = React.useState([]);
    const [ uploadingCursor, setUploadingCursor ] = React.useState(-1);
    const fileIndices = React.useRef(null);
    const lastCursor = React.useRef(-1);
    const uploadErrors = React.useRef(new Set());
    const dbProcessing = React.useRef(new Set());
    const thumbProcessing = React.useRef(new Set());

    const setUploadSelection = React.useCallback((files) => {
        fileIndices.current = new Map();
        lastCursor.current = files.length - 1;
        const getItemFullPath = imageContext.getItemFullPath;
        const fileWrappers = files.map((file, index) => {
            const fullPath = getItemFullPath(file.name);
            fileIndices.current.set(fullPath, index);
            const fileWrapper = {
                name: file.name,
                fullPath: fullPath,
                size: file.size,
                nativeFile: file
            };
            return fileWrapper;
        });
        setUploadingCursor(Math.min(fileWrappers.length - 1, _maxParallelUpload - 1));
        setFilesToUpload(fileWrappers);
        const addStorageItems = imageContext.addStorageItems
        addStorageItems(fileWrappers, ITEM_TYPE_FILE);
    }, [
        imageContext.addStorageItems,
        imageContext.getItemFullPath
    ]);

    const insertInDatabase = React.useCallback((fileFullPath) => {
        if (!imageContext.isDestinationFolder) {
            return Promise.resolve();
        }
        dbProcessing.current.add(fileFullPath);
        return dataProvider.insertImageInDatabase(fileFullPath)
            .then((newImage) => {
                const { year, title } = imageContext.destinationProps;
                queryContext.addDestinationImage(year, title, newImage);
                dbProcessing.current.delete(fileFullPath);
            }).catch((e) => {
                // TODO
            });
    }, [dataProvider, imageContext.isDestinationFolder, imageContext.destinationProps, queryContext]);

    const generateThumbnails = React.useCallback((fileFullPath) => {
        thumbProcessing.current.add(fileFullPath);
        const thumbPromise =
            imageContext.isDestinationFolder ?
            dataProvider.refreshThumbnails(fileFullPath) :
            dataProvider.createInteriorThumbnails(fileFullPath);

        return thumbPromise.then(() => {

            // Add thumbnails in imageContext
            const itemThumbnails = 
                getThumbnailsFromImageName(fileFullPath)
                .map(thumbFullPath => getFileNameFromFullPath(thumbFullPath));

            const addThumbs = imageContext.addThumbs;
            addThumbs(itemThumbnails);

            thumbProcessing.current.delete(fileFullPath);
        }).catch((e) => {
                // TODO
        });
    }, [
        dataProvider,
        imageContext.isDestinationFolder,
        imageContext.addThumbs
    ]);

    const onAllFilesProcessed = React.useCallback(() => {
        // Clear upload state, and keep only failing uploads.
        setFilesToUpload(files => files.filter(f => uploadErrors.current.has(f.fullPath)));
        setUploadingCursor(-1);
        fileIndices.current = null;
        lastCursor.current = -1;
    }, [])

    const onFileProcessed = React.useCallback((fileFullPath, error) => {
        setUploadingCursor(cursor => cursor + 1);
        if (error) {
            uploadErrors.add(fileFullPath);
        }
    }, []);

    React.useEffect(() => {
        if (uploadingCursor > lastCursor.current) {
            onAllFilesProcessed();
        }
    }, [uploadingCursor, onAllFilesProcessed])

    const canStartUpload = React.useCallback((fileFullPath) => {
        const fileIndex = fileIndices.current.get(fileFullPath);
        return (fileIndex <= uploadingCursor);
    }, [uploadingCursor]);

    const isUploading = React.useCallback((fullPath) => {
        return filesToUpload.some(fileToUpload => fileToUpload.fullPath === fullPath)
    }, [filesToUpload]);

    const isDbProcessing = React.useCallback((fullPath) => {
        return dbProcessing.current.has(fullPath);
    }, []);

    const isThumbProcessing = React.useCallback((fullPath) => {
        return thumbProcessing.current.has(fullPath);
    }, []);

    const uploadContext = {
        setUploadSelection,
        canStartUpload,
        onFileProcessed,
        generateThumbnails,
        insertInDatabase,
        isUploading,
        isDbProcessing,
        isThumbProcessing
    };

    return (
        <UploadContext.Provider value={uploadContext}>
          { children }
        </UploadContext.Provider>
    )
}

export const useUploadContext = () => React.useContext(UploadContext)