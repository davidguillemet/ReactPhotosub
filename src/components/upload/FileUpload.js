import React from 'react';
import { useDataProvider } from 'components/dataProvider';
import BorderLinearProgress from 'components/borderLinearProgress';

const FileUpload = ({file, folderPath, fileFullPath, start, onFileUploaded, onFileUploadError}) => {

    const dataProvider = useDataProvider();
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
    }, []);

    React.useEffect(() => {
        if (start === true)
        {
            const onFileProgress = (progressEvent) => {
                const { loaded, total } = progressEvent;
                const progress = (loaded / total) * 100;
                setProgress(progress);
            };
            dataProvider.uploadFile(file, folderPath, onFileProgress)
            .then((data) => {
                const fileInfo = data.find(info => info.file === file.name);
                if (!fileInfo) {
                    throw new Error(`Missing sizeRatio for ${file.name}`);
                }
                onFileUploaded(fileFullPath, fileInfo.sizeRatio);
            }).catch((error) => {
                setError(error)
                if (onFileUploadError) {
                    onFileUploadError(fileFullPath, error);
                }
            });
        }
    }, [dataProvider, file, fileFullPath, folderPath, start, onFileUploaded, onFileUploadError]);

    if (error) {
        return error.message
    }
    return (
        <BorderLinearProgress variant="determinate" value={progress} sx={{width: "100%"}}/>
    );
}

export default FileUpload;
