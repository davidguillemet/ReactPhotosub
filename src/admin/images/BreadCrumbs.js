import React from 'react';
import { Box } from '@mui/system';
import { Breadcrumbs } from '@mui/material';
import { IconButton, Link } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { TextField } from '@mui/material';
import { useGlobalContext } from '../../components/globalContext';
import { useToast } from '../../components/notifications';

const StorageBreadcrumbs = ({storageRef, onSetBucketPath}) => {
    const context = useGlobalContext();
    const { toast } = useToast();
    const [ refHierarchy, setRefHierarchy ] = React.useState([]);
    const [ editMode, setEditMode ] = React.useState(false);
    const [ newFolderName, setNewFolderName ] = React.useState("");

    React.useEffect(() => {
        const references = [];
        let ref = storageRef;
        do {
            references.push({
                name: ref.parent === null ? storageRef.bucket : ref.name,
                fullPath: ref.fullPath
            })
            ref = ref.parent; 
        } while (ref !== null);
        setRefHierarchy(references.reverse());
        setNewFolderName(storageRef.name);
    }, [storageRef]);

    const handleClick = React.useCallback((event) => {
        event.preventDefault();
        onSetBucketPath(event.target.id);
    }, [onSetBucketPath])

    const handleOnClickEdit = React.useCallback(() => {
        setEditMode(true);
    }, [])

    const handleOnClickSaveName = React.useCallback(() => {
        context.dataProvider.renameFolder(storageRef.fullPath, `${storageRef.parent.fullPath}/${newFolderName}`)
        .then(() => {
            toast.success("Le répertoire a été renommé.");
        })
        .catch(error => {
            setNewFolderName(storageRef.name);
            toast.error(error.message);
        }).finally(() => {
            setEditMode(editMode => !editMode);
        })
    }, [context, storageRef, newFolderName, toast])

    const onFolderNameChange = React.useCallback((event) => {
        setNewFolderName(event.target.value);
    }, []);

    return (
        <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
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
                storageRef.parent !== null && // Not possible to edit the bucket root name
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