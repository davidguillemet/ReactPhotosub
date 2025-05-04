import React from 'react';
import { useFirebaseContext } from 'components/firebase';
import BorderLinearProgress from 'components/borderLinearProgress';

const FileUpload = ({file, fileFullPath, start, onFileUploaded}) => {

    const firebaseContext = useFirebaseContext();
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
    }, []);

    React.useEffect(() => {
        if (start === true)
        {
            // launch firebase upload
            // see documentation at https://firebase.google.com/docs/storage/web/upload-files
            const fileStorageRef = firebaseContext.storageRef(fileFullPath);
            const uploadTaskRef = firebaseContext.upload(fileStorageRef, file, { contentType: file.type });

            const unsubscribe = uploadTaskRef.on('state_changed', 
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

            return () => {
                unsubscribe();
                if (uploadTaskRef.snapshot.state === 'running') {
                    uploadTaskRef.cancel();
                }
            }
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
