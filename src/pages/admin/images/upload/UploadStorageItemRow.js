import React from 'react';
import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUpload from 'components/upload';
import { useUploadContext } from "./UploadContext";

const UploadStorageItemRow = ({file}) => {

    const uploadContext = useUploadContext();

    const onFileUploaded = React.useCallback(() => {
        // launch file post processing after upload
        const postProcessUploadedFile = uploadContext.postProcessUploadedFile;
        postProcessUploadedFile(file.fullPath);
    }, [file, uploadContext.postProcessUploadedFile]);

    return (
        <TableRow
            role="checkbox"
            tabIndex={-1}
            key={file.name}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
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
            <TableCell colSpan={3} align="left" sx={{paddingTop: 0, paddingBottom: 0}} >
                <FileUpload
                    file={file.nativeFile}
                    fileFullPath={file.fullPath}
                    start={uploadContext.canStartUpload(file.fullPath)}
                    onFileUploaded={onFileUploaded}
                /> :
            </TableCell>
        </TableRow>
    )
}

export default UploadStorageItemRow;
