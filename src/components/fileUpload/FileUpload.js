import React, { useEffect, useState, useRef, useCallback } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import { Typography } from '@mui/material';
import { useGlobalContext } from '../globalContext';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ErrorIcon from '@mui/icons-material/Error';
import { useToast } from '../notifications';

import './fileUploadStyles.css';
import { useFirebaseContext } from '../firebase';

const STEP_UPLOAD = "step::upload";
const STEP_THUMBNAILS = "step::thumbnail";
const STEP_ERROR = "step::error";

const UploadProgress = ({progress}) => {
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <CircularProgress variant="determinate" thickness={15} value={progress} size={30}/>
            <HorizontalSpacing factor={1} />
            <Typography
                variant="caption"
                style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 200
                }}>
                Chargement du fichier...
            </Typography>
        </Box>
    );
};

const ThumbnailGeneration = () => {
    return (
        <Box style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        }}>
            <CircularProgress thickness={15} size={30} />
            <HorizontalSpacing factor={1} />
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

const FileProgress = ({file, storageRef, onCancel, onFileUploaded}) => {

    const firebaseContext = useFirebaseContext();
    const context = useGlobalContext();
    const [step, setStep] = useState({ name: STEP_UPLOAD, error: null });
    const [progress, setProgress] = useState(0);
    const uploadTaskRef = useRef(null);
    const { toast } = useToast();

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

    useEffect(() => {
        // launch firebase upload
        // see documentation at https://firebase.google.com/docs/storage/web/upload-files
        const parentPath = storageRef.fullPath;
        const fileStorageRef = firebaseContext.storageRef(parentPath + "/" + file.name);
        uploadTaskRef.current = firebaseContext.upload(fileStorageRef, file, { contentType: file.type });

        uploadTaskRef.current.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            }, 
            (error) => {
                // Handle unsuccessful uploads
                console.error(error);
                setStep({ name: STEP_ERROR, error: error });
            }, 
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                setStep({ name: STEP_THUMBNAILS, error: null });
                context.dataProvider.waitForThumbnails(file.name).then((fileProps) => {
                    const { sizeRatio } = fileProps;
                    onFileUploaded(file.name, sizeRatio);
                    onCancel(file);
                }).catch(error => {
                    setStep({ name: STEP_ERROR, error: error });
                });
            }
        );

        return () => {
            if (uploadTaskRef.current.snapshot.state === 'running') {
                uploadTaskRef.current.cancel();
            }
        }
    }, [file, storageRef, onCancel, onFileUploaded, context.dataProvider, firebaseContext]);

    return (
        <Box>
            <VerticalSpacing factor={1} />
            <Paper
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                <IconButton color="secondary" aria-label="menu" onClick={handleCancel} size="large">
                    <CancelOutlinedIcon />
                </IconButton>
                <Typography style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{file.name}</Typography>
                <HorizontalSpacing factor={2} />
                <div style={{ flex: 1}} />
                {
                    step.name === STEP_UPLOAD ?
                    <UploadProgress progress={progress} /> :
                    step.name === STEP_THUMBNAILS ?
                    <ThumbnailGeneration /> :
                    <ThumbnailError error={step.error}/>
                }
                <HorizontalSpacing factor={2} />
            </Paper>
        </Box>
    );
}

const FileUpload = ({caption, uploadRef, onFileUploaded}) => {

    const [uploadFiles, setUploadFiles] = useState([]);

    const handleFileSelection = (event) => {
        const { target: { files } } = event;
        const _files = [];
        for (let i = 0; i < files.length; i++) {
            _files.push(files[i]);
        }
        // Reset the input value to be able to upload the same file again
        // For example after having removed it
        event.target.value = "";
        setUploadFiles(_files);
    }

    const onCancel = useCallback((canceledFile) => {
        setUploadFiles(prevFiles => {
            return prevFiles.filter(file => file !== canceledFile);
        });
    }, []);

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
                    disabled={uploadFiles.length > 0}
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
                    uploadFiles.map((file) => {
                        return (
                            <CSSTransition
                                key={file.name}
                                timeout={200}
                                classNames="fileProgress"
                            >                
                                <FileProgress
                                    key={file.name}
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

export default FileUpload;
