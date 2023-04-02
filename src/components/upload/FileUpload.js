import React from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useFirebaseContext } from 'components/firebase';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

const FileUpload = ({file, fileFullPath, start, onFileUploaded}) => {

    const firebaseContext = useFirebaseContext();
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState(null);
    const uploadTaskRef = React.useRef(null);
    const unsubscribe = React.useRef(null);

    React.useEffect(() => {
        return () => {
            if (unsubscribe.current !== null) {
                unsubscribe.current();
            }
            if (uploadTaskRef.current !== null && uploadTaskRef.current.snapshot.state === 'running') {
                uploadTaskRef.current.cancel();
            }
        }
    }, []);

    React.useEffect(() => {
        if (start === true && uploadTaskRef.current === null)
        {
            // launch firebase upload
            // see documentation at https://firebase.google.com/docs/storage/web/upload-files
            const fileStorageRef = firebaseContext.storageRef(fileFullPath);
            uploadTaskRef.current = firebaseContext.upload(fileStorageRef, file, { contentType: file.type });

            unsubscribe.current = uploadTaskRef.current.on('state_changed', 
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress);
                }, 
                (error) => {
                    // Handle unsuccessful uploads
                    setError(error);
                }, 
                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    onFileUploaded(fileFullPath);
                }
            );
        }
    }, [file, fileFullPath, start, firebaseContext, onFileUploaded]);

    if (error) {
        return error.message
    }
    return (
        <BorderLinearProgress variant="determinate" value={progress} sx={{width: "100%"}}/>
    );
}

export default FileUpload;
