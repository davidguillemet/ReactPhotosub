import React from 'react';
import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUpload from 'components/upload';
import { useUploadContext } from "./UploadContext";
import { useImageKit } from 'utils';

const UploadStorageItemRow = ({file}) => {

    const uploadContext = useUploadContext();

    const onFileUploaded = React.useCallback(() => {
        // launch file post processing after upload
        const postProcessUploadedFile = uploadContext.postProcessUploadedFile;
        postProcessUploadedFile(file.fullPath);
    }, [file, uploadContext.postProcessUploadedFile]);

    const onFileUploadError = React.useCallback((_fileFullPath, error) => {
        const onUploadFileError = uploadContext.onUploadFileError;
        onUploadFileError(file.fullPath, error);
    }, [file, uploadContext.onUploadFileError]);

    const uploadColspan = useImageKit ? 2 /* No thumbnails */: 3;

    return (
        <TableRow
            role="checkbox"
            tabIndex={-1}
            key={file.name}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    disabled={true}
                />
            </TableCell>
            <TableCell
                component="th"
                id={file.name}
                scope="row"
                padding="none"
            >
                <Chip icon={<InsertPhotoIcon />} label={file.name} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            </TableCell>
            <TableCell colSpan={uploadColspan} align="left" sx={{paddingTop: 0, paddingBottom: 0}} >
                <FileUpload
                    file={file.nativeFile}
                    fileFullPath={file.fullPath}
                    folderPath={file.folderPath}
                    start={uploadContext.canStartUpload(file.fullPath)}
                    onFileUploaded={onFileUploaded}
                    onFileUploadError={onFileUploadError}
                />
            </TableCell>
        </TableRow>
    )
}

export default UploadStorageItemRow;
