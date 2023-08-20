import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableBody, TableCell, Chip, Box, Link} from "@mui/material";
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Paper } from "@mui/material";
import { withLoading, buildLoadingState } from "components/hoc";
import { useQueryContext } from "components/queryContext";
import { useReactQuery } from "components/reactQuery";
import { VerticalSpacing } from 'template/spacing';
import { useImageContext } from '../ImageContext';

const ImageErrorTableRow = ({file}) => {

    const imageContext = useImageContext();

    const handleOnRowClick = React.useCallback(() => {
        if (file.path !== imageContext.folderPath) {
            const imageContext_onRowClick = imageContext.onRowClick;
            imageContext_onRowClick({fullPath: file.path});
        }
    }, [
        imageContext.onRowClick,
        imageContext.folderPath,
        file
    ]);

    return (
        <TableRow>
            <TableCell align={'left'} sx={{paddingTop: 1, paddingBottom: 1}}>
                <Chip color="error" icon={<InsertPhotoIcon />} label={file.name} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            </TableCell>
            <TableCell align={'left'} sx={{paddingTop: 0, paddingBottom: 0}}>
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", paddingTop: 0, paddingBottom: 0}}>
                    <FolderOpenIcon sx={{mr: 1, ml: 2, opacity: 0.6}}></FolderOpenIcon>
                    <Link component="button" onClick={handleOnRowClick}>{`${file.path}/`}</Link>
                </Box>
            </TableCell>
            <TableCell align={'left'} sx={{paddingTop: 0, paddingBottom: 0}}>L'image n'a pas de tags en base</TableCell>
        </TableRow>
    )
}
const ImageErrorsUi = withLoading(({errors}) => {
    const [ expanded, setExpanded ] = React.useState(false);

    const onToggleExpand = React.useCallback(() => {
        setExpanded(expanded => !expanded);
    }, []);

    if (errors === null || errors.noTags === null || errors.noTags.length === 0) {
        return;
    }

    return (
        <React.Fragment>
            <Alert
                severity="error"
                action={
                    <IconButton color="inherit" size="small" onClick={onToggleExpand}>
                        {
                            expanded ?
                            <ExpandLessOutlinedIcon /> :
                            <ExpandMoreOutlinedIcon />
                        }
                    </IconButton>
                }>
                    {`${errors.noTags.length} erreurs en base:`}
            </Alert>
            <Collapse in={expanded}>
                <TableContainer component={Paper} sx={{display: 'flex', flexDirection: 'column'}}>
                    <Table sx={{ width: "100%" }} size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell align={'left'} >Fichier</TableCell>
                                <TableCell align={'left'} >Chemin</TableCell>
                                <TableCell align={'left'} >Erreur</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {
                            errors.noTags.map((file) => {
                                const key = `${file.path}/${file.name}`;
                                return <ImageErrorTableRow key={key} file={file} />
                            })
                        }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
            <VerticalSpacing factor={3} />
        </React.Fragment>
    )
}, [buildLoadingState("errors", [undefined])]);

const ImageErrors = () => {
    const queryContext = useQueryContext();
    const { data } = useReactQuery(queryContext.useFetchImageErrors);
    return <ImageErrorsUi errors={data} />
}

export default ImageErrors;