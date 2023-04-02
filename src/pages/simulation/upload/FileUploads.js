import React, { useEffect, useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { VerticalSpacing, HorizontalSpacing } from '../../../template/spacing';
import { Typography } from '@mui/material';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ErrorIcon from '@mui/icons-material/Error';
import { useToast } from 'components/notifications';

import './fileUploadStyles.css';
import { useDataProvider } from 'components/dataProvider';
import FileUpload from 'components/upload/FileUpload';

const STEP_UPLOAD = "step::upload";
const STEP_THUMBNAILS = "step::thumbnail";
const STEP_ERROR = "step::error";
const STEP_SUCCESS = "step::success";

const ThumbnailGeneration = () => {
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <HorizontalSpacing factor={2} />
            <CircularProgress size={30} />
            <HorizontalSpacing factor={2} />
            <Typography
                variant="caption"
                style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200
                }}>
                Création des vignettes...
            </Typography>
        </Box>
    );
}

const ThumbnailError = ({error}) => {
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <ErrorIcon />
            <HorizontalSpacing factor={1} />
            <Typography
                variant="caption"
                style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200
                }}>
                {error.message}
            </Typography>
        </Box>
    );
}

const UploadSuccess = () => {
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <Typography
                variant="caption"
                style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200
                }}>
                Fichier chargé avec succès
            </Typography>
        </Box>
    );
}

const FileProgress = React.forwardRef(({file, storageRef, onCancel, onFileUploaded}, ref) => {

    const dataProvider = useDataProvider();
    const [step, setStep] = useState({ name: STEP_UPLOAD, error: null });
    const { toast } = useToast();

    const fileFullPath = React.useRef(`${storageRef.fullPath}/${file.name}`);

    const handleCancel = useCallback(() => {
        // Task is stopped by the cleanup function above
        onCancel(file);
    }, [file, onCancel]);

    useEffect(() => {
        if (step.name === STEP_ERROR) {
            setTimeout(() => handleCancel(), 5000);
            toast.error(step.error.message);
        }
    }, [step, handleCancel, toast]);

    const onFileUploadCompleted = React.useCallback(() => {
        setStep({ name: STEP_THUMBNAILS, error: null });
        dataProvider.createInteriorThumbnails(fileFullPath.current).then((fileProps) => {
            const { sizeRatio } = fileProps;
            onFileUploaded(file.name, sizeRatio);
        }).then(() => {
            setStep({ name: STEP_SUCCESS, error: null });
        }).catch(error => {
            setStep({ name: STEP_ERROR, error: error });
        });
    }, [dataProvider, file, onFileUploaded]);

    return (
        <Box ref={ref}>
            <VerticalSpacing factor={1} />
            <Paper
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center'
                }} 
            >
                {
                    step.name === STEP_SUCCESS ?
                    <IconButton color="secondary" aria-label="menu" onClick={null} size="large">
                        <CheckCircleOutlineOutlinedIcon />
                    </IconButton> :
                    <IconButton color="secondary" aria-label="menu" onClick={handleCancel} size="large">
                        <CancelOutlinedIcon />
                    </IconButton>
                }
                <Typography style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</Typography>
                <HorizontalSpacing factor={2} />
                <Box sx={{display: "flex", flexDirection: "row", flexGrow: 1}}>
                {
                    step.name === STEP_UPLOAD ?
                    <FileUpload file={file} fileFullPath={fileFullPath.current} start={true} onFileUploaded={onFileUploadCompleted} /> :
                    step.name === STEP_THUMBNAILS ?
                    <ThumbnailGeneration /> :
                    step.name === STEP_ERROR ?
                    <ThumbnailError error={step.error}/> :
                    <UploadSuccess />
                }
                </Box>
                <HorizontalSpacing factor={2} />
            </Paper>
        </Box>
    );
});

const FileUploads = ({caption, uploadRef, onFilesUploaded}) => {

    const [filesToUpload, setFilesToUpload] = useState([]);
    const uploadedFiles = React.useRef(new Map());

    const handleFileSelection = (event) => {
        const { target: { files } } = event;
        const _files = [];
        for (let i = 0; i < files.length; i++) {
            _files.push(files[i]);
        }
        // Reset the input value to be able to upload the same file again
        // For example after having removed it
        event.target.value = "";
        setFilesToUpload(_files);
    }

    const onCancel = useCallback((canceledFile) => {
        setFilesToUpload(prevFiles => {
            return prevFiles.filter(file => file !== canceledFile);
        });
        uploadedFiles.current.delete(canceledFile.name);
    }, []);

    const onFileUploaded = useCallback((fileName, fileSizeRatio) => {
        uploadedFiles.current.set(fileName, fileSizeRatio);
        if (uploadedFiles.current.size === filesToUpload.length) {
            setFilesToUpload([]);
            onFilesUploaded(uploadedFiles.current);
        }
    }, [filesToUpload, onFilesUploaded]);

    return (
        <React.Fragment>
            <VerticalSpacing factor={1} />
            <input
                accept="image/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleFileSelection}
                style={{
                    display: 'none'
                }}
            />
            <label htmlFor="contained-button-file">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={filesToUpload.length > 0}
                >
                    {caption}
                </Button>
            </label>
            <Box style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <TransitionGroup component={null}>
                {
                    filesToUpload.map((file) => {
                        const progressRef = React.createRef(null);
                        return (
                            <CSSTransition
                                key={file.name}
                                nodeRef={progressRef}
                                timeout={200}
                                classNames="fileProgress"
                            >                
                                <FileProgress
                                    key={file.name}
                                    ref={progressRef}
                                    file={file}
                                    onCancel={onCancel}
                                    onFileUploaded={onFileUploaded}
                                    storageRef={uploadRef}/>
                            </CSSTransition>
                        );
                    })
                }
                </TransitionGroup>
            </Box>
        </React.Fragment>
    );
}

export default FileUploads;
