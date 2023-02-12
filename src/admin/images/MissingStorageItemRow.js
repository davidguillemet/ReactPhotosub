import React from 'react';
import { ITEM_TYPE_FILE, ITEM_TYPE_FOLDER } from "./common";
import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { STATUS_ERROR, StorageItemStatus } from './StorageItemStatus';
import useImageContext from './ImageContextHook';

const MissingStorageItemRow = ({item, type}) => {

    const imageContext = useImageContext();

    const fixMissingFolder = React.useCallback(() => {
        imageContext.createFolder(item.name);
    }, [imageContext, item]);

    const fixMissingFile = React.useCallback(() => {
        imageContext.uploadFile();
    }, [imageContext]);

    const errorCaption =
        type === ITEM_TYPE_FILE ? "L'image existe en base mais pas dans storage" :
        "Ce répertoire n'existe pas dans Storage alors qu'il contient des images en base";

    return (
        <TableRow
            role="checkbox"
            tabIndex={-1}
            key={item.name}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    disabled={true}
                />
            </TableCell>
            <TableCell
                component="th"
                id={item.name}
                scope="row"
                padding="none"
            >
                <Chip color="error" icon={<InsertPhotoIcon />} label={item.name} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            </TableCell>
            <TableCell align="left"></TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>{" - "}</TableCell>
            <TableCell align="left" sx={{paddingTop: 0, paddingBottom: 0}}>
                <StorageItemStatus
                    status={STATUS_ERROR}
                    message={errorCaption}
                    onFix={type === ITEM_TYPE_FOLDER ? fixMissingFolder : fixMissingFile}
                    fixCaption={type === ITEM_TYPE_FOLDER ? "Créer le répertoire dans storage" : "Rechercher et transférer le fichier manquant"}
                    fixIcon={type === ITEM_TYPE_FOLDER ? CreateNewFolderOutlinedIcon : SearchOutlinedIcon }
                />
            </TableCell>
        </TableRow>
    )
}

export default MissingStorageItemRow;