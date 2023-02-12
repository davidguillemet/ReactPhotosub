import React, { useEffect } from 'react';
import {unstable_batchedUpdates} from 'react-dom';
import { Box } from '@mui/system';
import { Stack } from '@mui/material';
import { IconButton } from '@mui/material';
import { buildLoadingState, withLoading } from '../../components/hoc';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { useFirebaseContext } from '../../components/firebase';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import { useGlobalContext } from '../../components/globalContext';
import FolderFormDialog from './FolderFormDialog';
import FileUploadSelection from './FileUploadSelection';
import StorageBreadcrumbs from './BreadCrumbs';
import { ITEM_TYPE_FILE, ITEM_TYPE_FOLDER } from './common';
import TableRows from './TableRows';
import MissingStorageFolders from './MissingStorageFolders';
import UploadTableRows from './UploadTableRows';
import ImageContext from './ImageContext';
import { throttle } from '../../utils';

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  { id: 'thumbStatus', label: 'Thumbnail Status' }, // Ok if all thumbnails have been created
  { id: 'dbStatus', label: 'Database Status' },     // Ok if the image exists in database
];

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
        } else {
            return null;
        }
    } else {
        return null;
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

const Images = withLoading(({foldersFromDb}) => {
    const firebaseContext = useFirebaseContext();
    const [ selectedItems, setSelectedItems ] = React.useState(new Set());
    const [ bucketPath, setBucketPath ] = React.useState(""); // bucket root
    const [ rows, setRows ] = React.useState({});
    const [ folderDialogOpen, setFolderDialogOpen ] = React.useState(false);
    const [ filesToUpload, setFilesToUpload ] = React.useState([]);
    const newFiles = React.useRef(new Set()); // to track new uploads to wait for thumb generation and db insertion
    const storageRef = React.useRef(firebaseContext.storageRef());
    const [ thumbsRef, setThumbsRef ] = React.useState(null);
    const destinationProps = React.useRef(null);
    const uploadButtonRef = React.useRef(null);

    const isNotThumbsFolder = React.useCallback((item) => item.name !== "thumbs", []);
    const isThumbsFolder = React.useCallback((item) => item.name === "thumbs", []);
    const isNotGhostFile = React.useCallback((item) => !firebaseContext.isGhostFile(item), [firebaseContext]);

    const fetchItems = React.useCallback(() => {
        firebaseContext.list(storageRef.current, { })
        .then(result => {
            setThumbsRef(result.prefixes.find(isThumbsFolder));
            const foldersFromStorage = result.prefixes.filter(isNotThumbsFolder);
            const missingFolders = getMissingStorageFolders(storageRef.current.fullPath, foldersFromStorage, foldersFromDb);
            setRows({
                folders: foldersFromStorage,
                files: result.items.filter(isNotGhostFile),
                missingFolders: missingFolders
            })
        })
    }, [firebaseContext, foldersFromDb, isThumbsFolder, isNotThumbsFolder, isNotGhostFile]);

    const onSetBucketPath = React.useCallback((bucketPath) => {
        unstable_batchedUpdates(() => {
            setRows({});
            setBucketPath(bucketPath);
        });
    }, []);

    const refreshThumbsRef = React.useCallback(() => {
        firebaseContext.list(storageRef.current, { })
        .then(result => {
            setThumbsRef(result.prefixes.find(isThumbsFolder));
        })
    }, [firebaseContext, isThumbsFolder]);

    useEffect(() => {
        storageRef.current = firebaseContext.storageRef(bucketPath);
        destinationProps.current = extractDestinationProps(bucketPath);
        fetchItems();
        setSelectedItems(new Set());
    }, [firebaseContext, bucketPath, fetchItems]);

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

    const isSelected = React.useCallback((row) => {
        return selectedItems.has(row.name);
    }, [selectedItems]);

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

    const handleOnClickCreateFolder = React.useCallback(() => {
        setFolderDialogOpen(true);
    }, []);

    const createFolder = React.useCallback((folderName) => {
        return firebaseContext.createFolder(storageRef.current, folderName)
        .then(() => {
            fetchItems();
        })
    }, [firebaseContext, fetchItems]);

    const onCloseFolderDialog = React.useCallback(() => {
        setFolderDialogOpen(false);
    }, []);

    const setUploadSelection = React.useCallback((files) => {
        const fileWrappers = files.map(file => {
            return {
                name: file.name,
                fullPath: `${storageRef.current.fullPath}/${file.name}`,
                size: file.size,
                nativeFile: file
            }
        })
        setFilesToUpload(fileWrappers);
    }, []);

    const onFileUploaded = React.useCallback((fileFullPath, sizeRatio) => {
        setFilesToUpload(files => files.filter(f => f.fullPath !== fileFullPath));
        newFiles.current.add(fileFullPath);
        fetchItems();
    }, [fetchItems]);

    const onUploadedFileCompleted = React.useCallback((item) => {
        newFiles.current.delete(item.fullPath);
    }, []);

    const imageContext = {
        storageRef: storageRef.current,
        onFileUploaded,
        onUploadedFileCompleted,
        onRowClick :handleOnRowClick,
        onRowSelected: onRowSelected,
        isSelected: isSelected,
        isNewFile: (row) => newFiles.current.has(row.fullPath),
        refreshThumbsRef: throttle(refreshThumbsRef, 1000, true /* leading */),
        createFolder: createFolder,
        uploadFile: () => uploadButtonRef.current.click(),
        isUploading: (fullPath) => filesToUpload.some(fileToUpload => fileToUpload.fullPath === fullPath)
    };

    const totalRows = (rows.files ? rows.files.length : 0) + (rows.folders ? rows.folders.length : 0);
    const allSelected = selectedItems.size > 0 && selectedItems.size === totalRows;
    const manySelected = selectedItems.size > 0 && selectedItems.size < totalRows;

    return (
        <ImageContext.Provider value={imageContext}>
        <TableContainer component={Paper}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    bgcolor: theme => theme.palette.secondary.light,
                    padding: 1
                }}
            >
                <StorageBreadcrumbs storageRef={storageRef.current} onSetBucketPath={onSetBucketPath} />
                <Stack direction="row" alignItems="center">
                    <IconButton onClick={handleOnClickCreateFolder}>
                        <CreateNewFolderOutlinedIcon sx={{color: theme => theme.palette.primary.contrastText}}></CreateNewFolderOutlinedIcon>
                    </IconButton>
                    <FileUploadSelection
                        ref={uploadButtonRef}
                        setUploadSelection={setUploadSelection}
                        disabled={destinationProps.current === null}
                    />
                </Stack>
            </Box>
            <Table sx={{ width: "100%" }} size="medium">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                indeterminate={manySelected}
                                checked={allSelected}
                                onChange={onSelectAllClick}
                                inputProps={{
                                    'aria-label': 'select all items',
                                }}
                            />
                        </TableCell>
                        {
                            columns.map(column => {
                                return (
                                    <TableCell
                                        key={column.id}
                                        align={'left'}
                                    >
                                        {column.label}
                                    </TableCell>
                                )
                            })
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    <UploadTableRows files={filesToUpload} />
                    <MissingStorageFolders dbFolders={rows.missingFolders} />
                    {
                        // Don't use withLoading since a CircularProgress cannot be a child of TableBody
                        rows.folders && 
                        <TableRows
                            rows={rows.folders}
                            type={ITEM_TYPE_FOLDER}
                        />
                    }
                    {
                         // Don't use withLoading since a CircularProgress cannot be a child of TableBody
                        rows.files &&
                        <TableRows
                            rows={rows.files}
                            destinationProps={destinationProps.current}
                            thumbsRef={thumbsRef}
                            type={ITEM_TYPE_FILE}
                        />
                    }
                </TableBody>
            </Table>
        </TableContainer>
        <FolderFormDialog
            open={folderDialogOpen}
            onClose={onCloseFolderDialog}
        />
        </ImageContext.Provider>
    )
}, [buildLoadingState("foldersFromDb", [undefined])]);

const ImagesController = () => {
    const context = useGlobalContext();
    const { data: folders } = context.useFetchImageFolders();
    return (
        <Images foldersFromDb={folders} />
    )
}

export default ImagesController;