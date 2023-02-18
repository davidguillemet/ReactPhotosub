import React from 'react';
import { useGlobalContext } from '../../components/globalContext';
import { useImageContext } from './ImageContext';

const UploadContext = React.createContext(null);

export const UploadContextProvider = ({children}) => {

    const context = useGlobalContext();
    const imageContext = useImageContext();
    const [ filesToUpload, setFilesToUpload ] = React.useState([]);
    const dbProcessing = React.useRef(new Set());
    const thumbProcessing = React.useRef(new Set());

    const setUploadSelection = React.useCallback((files, parentFolder) => {
        const fileWrappers = files.map(file => {
            return {
                name: file.name,
                fullPath: `${parentFolder}/${file.name}`,
                size: file.size,
                nativeFile: file
            }
        })
        setFilesToUpload(fileWrappers);
    }, []);

    // TODO : Don't use destinationProps here since it might have changed since beginning of upload
    // IF the user changed the current folder after having started an upload
    const _launchDbProcessing = React.useCallback((fileFullPath) => {
        dbProcessing.current.add(fileFullPath);
        return context.dataProvider.insertImageInDatabase(fileFullPath)
            .then(() => {
                context.clearDestinationImages( // Throttling
                    imageContext.destinationProps.year,
                    imageContext.destinationProps.title);
            }).catch((e) => {
                // TODO
            });
    }, [context, imageContext.destinationProps]);

    const _launchThumbProcessing = React.useCallback((fileFullPath) => {
        thumbProcessing.current.add(fileFullPath);
        return context.dataProvider.refreshThumbnails(fileFullPath)
            .then(() => {
                const refresh = imageContext.refreshThumbnails; // Throttling
                refresh();
            }).catch((e) => {
                // TODO
            });
    }, [context, imageContext.refreshThumbnails]);

    const onFileUploaded = React.useCallback((fileFullPath) => {
        const fetchItems = imageContext.fetchItems;
        // TODO : it's not possible to use throttling with the Promise fetchItems, but
        //        we should find a way to limit the number of calls to fetchItems
        //        when we upload many files.
        fetchItems().then(() => {
            _launchDbProcessing(fileFullPath);
            _launchThumbProcessing(fileFullPath);
            setFilesToUpload(files => files.filter(f => f.fullPath !== fileFullPath));
        })
    }, [imageContext.fetchItems, _launchDbProcessing, _launchThumbProcessing]);

    const uploadContext = {
        files: filesToUpload,
        setUploadSelection,
        onFileUploaded,
        generateThumbnails: _launchThumbProcessing,
        insertInDatabase: _launchDbProcessing,
        isUploading: (fullPath) => filesToUpload.some(fileToUpload => fileToUpload.fullPath === fullPath),
        isDbProcessing:  (fullPath) => dbProcessing.current.has(fullPath),
        onDbProcessingCompleted: (fullPath) => dbProcessing.current.delete(fullPath),
        isThumbProcessing: (fullPath) => thumbProcessing.current.has(fullPath),
        onThumbProcessingCompleted: (fullPath) => thumbProcessing.current.delete(fullPath),
    };

    return (
        <UploadContext.Provider value={uploadContext}>
          { children }
        </UploadContext.Provider>
    )
}

export const useUploadContext = () => React.useContext(UploadContext)