import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import Button from '@material-ui/core/Button';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import { Typography } from '@material-ui/core';
import { GlobalContext } from '../../components/globalContext';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './fileUploadStyles.css';

const STEP_UPLOAD = "upload";
const STEP_THUMBAILS = "thumbnail";

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

const FileProgress = ({file, storageRef, onCancel, onFileUploaded}) => {

    const context = useContext(GlobalContext);
    const [step, setStep] = useState(STEP_UPLOAD);
    const [progress, setProgress] = useState(0);
    const uploadTaskRef = useRef(null);

    const handleCancel = useCallback(() => {
        // Task is stopped by the cleanup function above
        onCancel(file);
    }, [file, onCancel]);

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
            }, 
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                setStep(STEP_THUMBAILS);
                context.dataProvider.waitForThumbnails(file.name).then(() => {
                    onFileUploaded(file.name);
                    onCancel(file);
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
                <IconButton
                    color="secondary"
                    aria-label="menu"
                    onClick={handleCancel}
                >
                    <CancelOutlinedIcon />
                </IconButton>
                <Typography style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{file.name}</Typography>
                <HorizontalSpacing factor={2} />
                <div style={{ flex: 1}} />
                {
                    step === STEP_UPLOAD ?
                    <UploadProgress progress={progress} /> :
                    <ThumbnailGeneration />
                }
                <HorizontalSpacing factor={2} />
            </Paper>
        </Box>
    );
}

const FileUpload = ({caption, user, onFileUploaded}) => {

    const context = useContext(GlobalContext);
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
