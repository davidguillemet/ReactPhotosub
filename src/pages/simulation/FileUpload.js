import React, { useEffect, useState, useRef, useCallback } from 'react';
import Button from '@mui/material/Button';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import { Typography } from '@mui/material';
import { useGlobalContext } from '../../components/globalContext';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ErrorIcon from '@mui/icons-material/Error';
import './fileUploadStyles.css';

const STEP_UPLOAD = "upload";
const STEP_THUMBAILS = "thumbnail";
const STEP_ERROR = "error";

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

const ThumbnailError = () => {
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
                Une erreur est survenue...
            </Typography>
        </Box>
    );
}

const FileProgress = ({file, storageRef, onCancel, onFileUploaded}) => {

    const context = useGlobalContext();
    const [step, setStep] = useState(STEP_UPLOAD);
    const [progress, setProgress] = useState(0);
    const uploadTaskRef = useRef(null);

    const handleCancel = useCallback(() => {
        // Task is stopped by the cleanup function above
        onCancel(file);
    }, [file, onCancel]);

    useEffect(() => {
        if (step === STEP_ERROR) {
            setTimeout(() => handleCancel(), 5000);
        }
    }, [step, handleCancel]);

    useEffect(() => {
        // launch firebase upload
        // see documentation at https://firebase.google.com/docs/storage/web/upload-files
        uploadTaskRef.current = storageRef.child(file.name).put(file);

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
            }, 
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                setStep(STEP_THUMBAILS);
                context.dataProvider.waitForThumbnails(file.name).then((fileProps) => {
                    const { sizeRatio } = fileProps;
                    onFileUploaded(file.name, sizeRatio);
                    onCancel(file);
                }).catch(error => {
                    console.error(error);
                    setStep(STEP_ERROR);
                });
            }
        );

        return () => {
            if (uploadTaskRef.current.snapshot.state === 'running') {
                uploadTaskRef.current.cancel();
            }
        }
    }, [file, storageRef, onCancel, onFileUploaded, context.dataProvider]);

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
                    step === STEP_UPLOAD ?
                    <UploadProgress progress={progress} /> :
                    step === STEP_THUMBAILS ?
                    <ThumbnailGeneration /> :
                    <ThumbnailError />
                }
                <HorizontalSpacing factor={2} />
            </Paper>
        </Box>
    );
}

const FileUpload = ({caption, user, onFileUploaded}) => {

    const context = useGlobalContext();
    const [uploadFiles, setUploadFiles] = useState([]);
    const userUploadRef = useRef(null);

    useEffect(() => {
        if (userUploadRef.current === null) {
            const storageRef = context.firebase.storage().ref();
            userUploadRef.current = storageRef.child(`userUpload/${user.uid}/interiors`);
        }
    }, [user, context.firebase]);

    const handleFileSelection = (event) => {
        const { target: { files } } = event;
        const _files = [];
        for (let i = 0; i < files.length; i++) {
            _files.push(files[i]);
        }
        // Reset the iput value to be able to upload the same file again
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
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadOutlinedIcon />}
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
                                    storageRef={userUploadRef.current}/>
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
