import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUploadProgress from './FileUploadProgress';
import useImageContext from "./ImageContextHook";

const UploadStorageItemRow = ({file, /*storageRef,*/ start}) => {
    const imageContext = useImageContext();

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
            <TableCell align="left">{file.size}</TableCell>
            <TableCell colSpan={2} align="left" sx={{paddingTop: 0, paddingBottom: 0}} >
                <FileUploadProgress
                    file={file}
                    //storageRef={storageRef}
                    start={start}
                    onFileUploaded={imageContext.onFileUploaded}
                />
            </TableCell>
        </TableRow>
    )
}

export default UploadStorageItemRow;
