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
import { useUploadContext } from './UploadContext';
import { getThumbnailsFromImageName } from '../../utils';
import { useFirebaseContext } from '../../components/firebase';

const ThumbIssueStatus = ({itemName, error}) => {

    const imageContext = useImageContext();
    const firebaseContext = useFirebaseContext();

    const [ status, setStatus ] = React.useState(error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE);

    React.useEffect(() => {
        setStatus(error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE);
    }, [error])

    const fixDeleteThumbnails = React.useCallback(() => {
        const itemFullPath = `${imageContext.storageRef.fullPath}/${itemName}`;
        const thumbnails = getThumbnailsFromImageName(itemFullPath);
        const deleteItems = firebaseContext.deleteItems;
        setStatus(STATUS_PENDING);
        deleteItems(thumbnails).finally(() => {
            const refreshThumbnails = imageContext.refreshThumbnails;
            refreshThumbnails();
        })
    }, [imageContext.storageRef, imageContext.refreshThumbnails, firebaseContext.deleteItems, itemName]);

    return (
        <StorageItemStatus
            status={status}
            message={"Des vignettes existent pour cette image qui n'existe pas dans Storage."}
            onFix={fixDeleteThumbnails}
            fixCaption={"Supprimer les vignettes"}
            fixIcon={DeleteOutlineIcon}
        />
    )
}

const DatabaseIssueStatus = ({itemName, error, type}) => {

    const imageContext = useImageContext();
    const uploadContext = useUploadContext();

    const fixMissingFolder = React.useCallback(() => {
        const createFolder = imageContext.createFolder;
        createFolder(itemName);
    }, [imageContext.createFolder, itemName]);

    const fixMissingFile = React.useCallback(() => {
        const onClickUpload = uploadContext.onClickUpload;
        onClickUpload();
    }, [uploadContext.onClickUpload]);

    const errorCaption =
        type === ITEM_TYPE_FILE ?
        "L'image existe en base mais pas dans storage" :
        "Ce répertoire n'existe pas dans Storage alors qu'il contient des images en base";

    return (
        <StorageItemStatus
            status={error === true ? STATUS_ERROR : STATUS_NOT_AVAILABLE}
            message={errorCaption}
            onFix={type === ITEM_TYPE_FOLDER ? fixMissingFolder : fixMissingFile}
            fixCaption={type === ITEM_TYPE_FOLDER ? "Créer le répertoire dans storage" : "Rechercher et transférer le fichier manquant"}
            fixIcon={type === ITEM_TYPE_FOLDER ? CreateNewFolderOutlinedIcon : SearchOutlinedIcon }
            errorIcon={FolderOpenIcon}
        />
    )
}

const MissingStorageItemRow = ({itemName, type, dbIssue = false, thumbIssue = false}) => {

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
            <TableCell align="left"></TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <ThumbIssueStatus itemName={itemName} error={thumbIssue} />
            </TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <DatabaseIssueStatus itemName={itemName} type={type} error={dbIssue} />
            </TableCell>
        </TableRow>
    )
}

export default MissingStorageItemRow;