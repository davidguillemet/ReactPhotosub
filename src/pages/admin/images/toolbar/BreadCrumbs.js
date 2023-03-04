import React from 'react';
import { Box } from '@mui/material';
import { Breadcrumbs } from '@mui/material';
import { IconButton, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { TextField } from '@mui/material';
import { useToast } from 'components/notifications';
import { useImageContext } from '../ImageContext';
import GlobalStatus from './GlobalStatus';
import { useDataProvider } from 'components/dataProvider';

const StorageBreadcrumbs = () => {
    const dataProvider = useDataProvider();
    const imageContext = useImageContext();
    const { toast } = useToast();
    const [ refHierarchy, setRefHierarchy ] = React.useState([]);
    const [ editMode, setEditMode ] = React.useState(false);
    const [ newFolderName, setNewFolderName ] = React.useState("");

    React.useEffect(() => {
        const references = [];
        let ref = imageContext.storageRef;
        do {
            references.push({
                name: ref.parent === null ? imageContext.storageRef.bucket : ref.name,
                fullPath: ref.fullPath
            })
            ref = ref.parent; 
        } while (ref !== null);
        setRefHierarchy(references.reverse());
        setNewFolderName(imageContext.storageRef.name);
    }, [imageContext.storageRef]);

    const handleClick = React.useCallback((event) => {
        event.preventDefault();
        const onSetBucketPath = imageContext.onSetBucketPath;
        onSetBucketPath(event.target.id);
    }, [imageContext.onSetBucketPath])

    const handleOnClickEdit = React.useCallback(() => {
        setEditMode(true);
    }, [])

    const handleOnClickSaveName = React.useCallback(() => {
        dataProvider.renameFolder(imageContext.storageRef.fullPath, `${imageContext.storageRef.parent.fullPath}/${newFolderName}`)
        .then(() => {
            toast.success("Le répertoire a été renommé.");
        })
        .catch(error => {
            setNewFolderName(imageContext.storageRef.name);
            toast.error(error.message);
        }).finally(() => {
            setEditMode(editMode => !editMode);
        })
    }, [dataProvider, imageContext.storageRef, newFolderName, toast])

    const onFolderNameChange = React.useCallback((event) => {
        setNewFolderName(event.target.value);
    }, []);

    return (
        <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}} component="span">
            <GlobalStatus />
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{color: theme => theme.palette.primary.contrastText}}/>} sx={{ml: 2, pv: 1}} >
            {
                refHierarchy.map((ref, index) => {
                    return (
                        index < refHierarchy.length - 1 ? <Link underline="hover" key={ref.fullPath} id={ref.fullPath} onClick={handleClick} sx={{color: theme => theme.palette.primary.contrastText}}>{ref.name}</Link> :
                        editMode === true ? <TextField key={ref.fullPath} value={newFolderName} multiline={false} size="small" onChange={onFolderNameChange}/> :
                        <Box key={ref.fullPath} sx={{color: theme => theme.palette.primary.contrastText}}>{ref.name}</Box>
                    )
                })
            }
            </Breadcrumbs>
            {
                imageContext.storageRef.parent !== null && // Not possible to edit the bucket root name
                <IconButton onClick={editMode ? handleOnClickSaveName : handleOnClickEdit} sx={{ml: 1, mv: 0}}>
                {
                    editMode === true ?
                    <CheckOutlinedIcon fontSize='small' sx={{color: theme => theme.palette.primary.contrastText}}/> :
                    <EditOutlinedIcon fontSize='small' sx={{color: theme => theme.palette.primary.contrastText}}/>
                }
                </IconButton>
            }
        </Box>
    )
}

export default StorageBreadcrumbs;