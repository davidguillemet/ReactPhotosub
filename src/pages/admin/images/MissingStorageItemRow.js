import React from 'react';
import { ITEM_TYPE_FILE, ITEM_TYPE_FOLDER } from "./common";
import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { STATUS_ERROR, STATUS_NOT_AVAILABLE, STATUS_PENDING, StorageItemStatus } from './itemStatus/StorageItemStatus';
import { useImageContext } from './ImageContext';
import { useUploadContext } from './upload/UploadContext';
import { useDataProvider } from 'components/dataProvider';

const ThumbIssueStatus = ({itemName, error}) => {

    const imageContext = useImageContext();
    const uploadContext = useUploadContext();

    const [ status, setStatus ] = React.useState(error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE);

    React.useEffect(() => {
        setStatus(error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE);
    }, [error])

    const fixMissingFile = React.useCallback(() => {
        const onClickUpload = uploadContext.onClickUpload;
        onClickUpload();
    }, [uploadContext.onClickUpload]);

    const fixDeleteThumbnails = React.useCallback(() => {
        setStatus(STATUS_PENDING);
        const itemFullPath = `${imageContext.bucketPath}/${itemName}`;
        const deleteThumbnails = imageContext.deleteThumbnails;
        deleteThumbnails(itemFullPath)
            .finally(() => {
                const refreshThumbnails = imageContext.refreshThumbnails;
                refreshThumbnails();
            })
    }, [
        imageContext.bucketPath,
        imageContext.deleteThumbnails,
        imageContext.refreshThumbnails,
        itemName
    ]);

    return (
        <StorageItemStatus
            status={status}
            message={"Des vignettes existent pour cette image qui n'existe pas dans Storage."}
            remediation={[
                {
                    onFix: fixMissingFile,
                    fixCaption: "Rechercher et transférer le fichier manquant",
                    fixIcon: SearchOutlinedIcon
                },
                {
                    onFix: fixDeleteThumbnails,
                    fixCaption: "Supprimer les vignettes",
                    fixIcon: DeleteOutlineIcon
                }
            ]}
        />
    )
}

const DatabaseIssueStatus = ({itemName, error, type}) => {

    const dataProvider = useDataProvider();
    const imageContext = useImageContext();
    const uploadContext = useUploadContext();

    const [ status, setStatus ] = React.useState(error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE);

    React.useEffect(() => {
        setStatus(error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE);
    }, [error])

    const fixMissingFolder = React.useCallback(() => {
        const createFolder = imageContext.createFolder;
        createFolder(itemName);
    }, [imageContext.createFolder, itemName]);

    const fixMissingFile = React.useCallback(() => {
        const onClickUpload = uploadContext.onClickUpload;
        onClickUpload();
    }, [uploadContext.onClickUpload]);

    const removeImageFromDatabase = React.useCallback(() => {
        setStatus(STATUS_PENDING);
        const itemFullPath = `${imageContext.bucketPath}/${itemName}`;
        dataProvider.removeImageFromDatabase(itemFullPath)
            .finally(() => {
                const clearImageQueries = imageContext.clearImageQueries;
                clearImageQueries();
            })
    }, [
        dataProvider,
        imageContext.clearImageQueries,
        imageContext.bucketPath,
        itemName
    ]);

    const errorCaption =
        type === ITEM_TYPE_FILE ?
        "L'image existe en base mais pas dans storage" :
        "Ce répertoire n'existe pas dans Storage alors qu'il contient des images en base";

    const remediation =
        type === ITEM_TYPE_FOLDER ?
        [
            {
                onFix: fixMissingFolder,
                fixCaption: "Créer le répertoire dans storage",
                fixIcon: CreateNewFolderOutlinedIcon
            }
        ] :
        [
            {
                onFix: fixMissingFile,
                fixCaption: "Rechercher et transférer le fichier manquant",
                fixIcon: SearchOutlinedIcon
            },
            {
                onFix: removeImageFromDatabase,
                fixCaption: "Supprimer l'image en base",
                fixIcon: DeleteOutlineIcon
            }
        ];

    return (
        <StorageItemStatus
            status={status}
            message={errorCaption}
            errorIcon={FolderOpenIcon}
            remediation={remediation}
        />
    )
}

const MissingStorageItemRow = ({itemName, type, dbIssue = false, thumbIssue = false}) => {
    const imageContext = useImageContext();

    React.useEffect(() => {
        const setContextItemStatus = imageContext.setItemStatus;
        setContextItemStatus(itemName, "error");
        // Cleanup function to decrease error count in case the removed item has an issue
        return function clearStatus() {
            const setContextItemStatus = imageContext.setItemStatus;
            setContextItemStatus(itemName, "success");
        }
    }, [itemName, imageContext.setItemStatus]);

    return (
        <TableRow
            role="checkbox"
            tabIndex={-1}
            key={itemName}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    disabled={true}
                />
            </TableCell>
            <TableCell
                component="th"
                id={itemName}
                scope="row"
                padding="none"
            >
                <Chip color="error" icon={<InsertPhotoIcon />} label={itemName} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <ThumbIssueStatus itemName={itemName} error={thumbIssue} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <DatabaseIssueStatus itemName={itemName} type={type} error={dbIssue} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>{" - "}</TableCell>
        </TableRow>
    )
}

export default MissingStorageItemRow;