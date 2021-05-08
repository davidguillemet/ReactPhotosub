import React, { useEffect, useState, useRef, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';

import { VerticalSpacing, HorizontalSpacing } from '../../template/spacing';
import { Typography } from '@material-ui/core';
import { uniqueID } from '../../utils/utils';

import { FirebaseApp } from '../../components/firebase';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './fileUploadStyles.css';

const useStyle = makeStyles((theme) => ({
    input: {
        display: 'none',
    },
}));

const FileProgress = ({file, storageRef, onCancel, onFileUploaded}) => {

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
                uploadTaskRef.current.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    onFileUploaded(file.name, downloadURL);
                });
                onCancel(file);
            }
        );

        return () => {
            if (uploadTaskRef.current.snapshot.state === 'running') {
                uploadTaskRef.current.cancel();
            }
        }
    }, [file, storageRef, onCancel, onFileUploaded]);

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
                <CircularProgress variant="determinate" thickness={15} value={progress} size={30}/>
                <HorizontalSpacing factor={2} />
            </Paper>
        </Box>
    );
}

const FileUpload = ({caption, user, onFileUploaded}) => {

    const classes = useStyle();

    const [uploadFiles, setUploadFiles] = useState([]);
    const userUploadRef = useRef(null);

    useEffect(() => {
        if (userUploadRef.current === null) {
            const storageRef = FirebaseApp.storage().ref();
            userUploadRef.current = storageRef.child(`userUpload/${user.uid}/interiors`);
        }
    }, [user]);

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
        setUploadFiles(prevFiles => prevFiles.filter(file => file !== canceledFile));
    }, []);

    return (
        <React.Fragment>
            <VerticalSpacing factor={1} />
            <input
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleFileSelection}
            />
            <label htmlFor="contained-button-file">
                <Button
                    variant="contained"
                    color="primary"
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
                        const key = uniqueID();
                        return (
                            <CSSTransition
                                key={key}
                                timeout={500}
                                classNames="fileProgress"
                            >                
                                <FileProgress
                                    key={key}
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
