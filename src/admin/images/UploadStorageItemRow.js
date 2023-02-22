import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUploadProgress from './FileUploadProgress';

const UploadStorageItemRow = ({file, start}) => {

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
                <FileUploadProgress file={file} start={start} />
            </TableCell>
        </TableRow>
    )
}

export default UploadStorageItemRow;
