import React from 'react';
import { styled } from '@mui/material/styles';
import { TableContainer, Table, TableHead, TableRow, TableBody, TableCell, Chip, Box, Link} from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
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
import { GlobalImageErrors } from "common/GlobalErrors";

const getErrorCount = (errors) => {
    if (!errors) return 0;
    return GlobalImageErrors.reduce((acc, errorType) => acc + (errors[errorType.id] ? errors[errorType.id].length : 0), 0);
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const ImageErrorTableRow = ({file, errorType}) => {

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
            <TableCell align={'left'} sx={{paddingTop: 0, paddingBottom: 0}}>{errorType.getErrorMessage(file)}</TableCell>
        </TableRow>
    )
}
const ImageErrorsUi = withLoading(({errors}) => {
    const [ expanded, setExpanded ] = React.useState(false);
    const [ displayedErrors, setDisplayedErrors ] = React.useState(
        GlobalImageErrors.filter(errorDef => errors[errorDef.id].length > 0)
        .map(errorDef => errorDef.id));

    const onToggleExpand = React.useCallback(() => {
        setExpanded(expanded => !expanded);
    }, []);

    const onChangeDisplayedErrors = React.useCallback((event, newValues) => {
        setDisplayedErrors(newValues);
    }, []);

    React.useEffect(() => {
        setDisplayedErrors(prevDisplayedErrors =>
            GlobalImageErrors
                // We keep the errors for which we have an instance and that was displayed before
                .filter(errorDef => errors[errorDef.id].length > 0 && prevDisplayedErrors.includes(errorDef.id))
                .map(errorDef => errorDef.id));
    }, [errors]);

    const errorCount = getErrorCount(errors);
    if (errorCount === 0) {
        return;
    }

    return (
        <React.Fragment>
        <TableContainer component={Paper} sx={{display: 'flex', flexDirection: 'column', paddingBottom: 0}}>
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
                    {`${errorCount} erreurs en base:`}
            </Alert>
            <VerticalSpacing factor={1} />
            <Collapse in={expanded}>
                <StyledToggleButtonGroup
                    size="small"
                    value={displayedErrors}
                    onChange={onChangeDisplayedErrors}
                >
                {
                    GlobalImageErrors.map(errorDef => {
                        const ButtonIcon = errorDef.icon;
                        const disabled = errors[errorDef.id].length === 0;
                        return (
                            <ToggleButton key={errorDef.id} value={errorDef.id} disabled={disabled}>
                                <ButtonIcon />
                            </ToggleButton>
                        )
                    })
                }
                </StyledToggleButtonGroup>
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
                        GlobalImageErrors.map(errorType => {
                            if (!displayedErrors.includes(errorType.id)) {
                                return null;
                            }
                            return errors[errorType.id].map((file) => {
                                const key = `${file.path}/${file.name}`;
                                return <ImageErrorTableRow key={key} file={file} errorType={errorType} />
                            })
                        })
                    }
                    </TableBody>
                </Table>
            </Collapse>
        </TableContainer>
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