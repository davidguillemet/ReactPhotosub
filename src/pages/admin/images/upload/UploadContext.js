import React from 'react';
import { useDataProvider } from 'components/dataProvider';
import { useImageContext } from '../ImageContext';

const _maxParallelUpload = 3;

const UploadContext = React.createContext(null);

export const UploadContextProvider = ({children}) => {

    const dataProvider = useDataProvider();
    const imageContext = useImageContext();
    const [ filesToUpload, setFilesToUpload ] = React.useState([]);
    const [ uploadingCursor, setUploadingCursor ] = React.useState(-1);
    const fileIndices = React.useRef(null);
    const lastCursor = React.useRef(-1);
    const uploadErrors = React.useRef(new Set());
    const dbProcessing = React.useRef(new Set());
    const thumbProcessing = React.useRef(new Set());

    const setUploadSelection = React.useCallback((files, parentFolder) => {
        fileIndices.current = new Map();
        lastCursor.current = files.length - 1;
        const fileWrappers = files.map((file, index) => {
            const fullPath = `${parentFolder}/${file.name}`;
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
    }, []);

    const insertInDatabase = React.useCallback((fileFullPath) => {
        if (!imageContext.isDestinationFolder) {
            return Promise.resolve();
        }
        dbProcessing.current.add(fileFullPath);
        return dataProvider.insertImageInDatabase(fileFullPath)
            .then(() => {
                dbProcessing.current.delete(fileFullPath);
            }).catch((e) => {
                // TODO
            });
    }, [dataProvider, imageContext.isDestinationFolder]);

    const generateThumbnails = React.useCallback((fileFullPath) => {
        thumbProcessing.current.add(fileFullPath);
        const thumbPromise =
            imageContext.isDestinationFolder ?
            dataProvider.refreshThumbnails(fileFullPath) :
            dataProvider.createInteriorThumbnails(fileFullPath);

        return thumbPromise.then(() => {
            thumbProcessing.current.delete(fileFullPath);
        }).catch((e) => {
                // TODO
        });
    }, [dataProvider, imageContext.isDestinationFolder]);

    const onAllFilesProcessed = React.useCallback(() => {
        // Clear upload state, and keep only failing uploads.
        setFilesToUpload(files => files.filter(f => uploadErrors.current.has(f.fullPath)));
        setUploadingCursor(-1);
        fileIndices.current = null;
        lastCursor.current = -1;

        // Fetch items to update list
        const fetchItems = imageContext.fetchItems;
        const clearImageQueries = imageContext.clearImageQueries;
        fetchItems().then(() => {
            clearImageQueries();
        });
    }, [imageContext.fetchItems, imageContext.clearImageQueries])

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
        files: filesToUpload,
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