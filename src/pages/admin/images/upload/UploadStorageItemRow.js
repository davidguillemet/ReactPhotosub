import React from 'react';
import { TableRow, TableCell, Checkbox, Chip } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import FileUpload from 'components/upload';
import { useUploadContext } from "./UploadContext";
import { useImageContext } from '../ImageContext';
import { useDataProvider } from 'components/dataProvider';
import BorderLinearProgress from 'components/borderLinearProgress';

const STEP_UPLOAD = "ste::upload";
const STEP_POST_PROCESS = "step::post_process";
const STEP_SUCCESS = "step::success";
const STEP_ERROR = "step::error";

const FilePostProcessing = ({fileFullPath, onSuccess, onError}) => {

    const dataProvider = useDataProvider();
    const imageContext = useImageContext();
    const uploadContext = useUploadContext();

    React.useEffect(() => {
        const generateThumbs = uploadContext.generateThumbnails;
        const thumbPromise = generateThumbs(fileFullPath);

        const dataBasePromise =
            imageContext.isDestinationFolder ?
            dataProvider.insertImageInDatabase(fileFullPath) :
            Promise.resolve();
        
        Promise.all([thumbPromise, dataBasePromise]).then(() => {
            onSuccess();
        });

    }, [
        uploadContext.generateThumbnails,
        imageContext.isDestinationFolder,
        dataProvider,
        fileFullPath,
        onSuccess
    ]);

    return (
        <BorderLinearProgress sx={{width: "100%"}}/>
    );
}

const UploadStorageItemRow = ({file}) => {

    const uploadContext = useUploadContext();
    const [step, setStep] = React.useState(STEP_UPLOAD);

    const onFileUploaded = React.useCallback(() => {
        // launch file post processing after upload
        setStep(STEP_POST_PROCESS);
    }, []);

    const onPostProcessSuccess = React.useCallback(() => {
        // Notify the upload context that this file has been processed successfully
        const onFileProcessed = uploadContext.onFileProcessed;
        onFileProcessed(file.fullPath);
        setStep(STEP_SUCCESS);
    }, [file, uploadContext.onFileProcessed]);

    const onPostProcessError = React.useCallback(() => {
        // Notify the upload context that this file has been processed with error
        setStep(STEP_ERROR);
    }, []);

    return (
        <TableRow
            role="checkbox"
            tabIndex={-1}
            key={file.name}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    disabled={true}
                />
            </TableCell>
            <TableCell
                component="th"
                id={file.name}
                scope="row"
                padding="none"
            >
                <Chip icon={<InsertPhotoIcon />} label={file.name} sx={{paddingLeft: 1.5, paddingRight: 1.5}} />
            </TableCell>
            <TableCell colSpan={3} align="left" sx={{paddingTop: 0, paddingBottom: 0}} >
                {
                    step === STEP_UPLOAD ?
                    <FileUpload
                        file={file.nativeFile}
                        fileFullPath={file.fullPath}
                        start={uploadContext.canStartUpload(file.fullPath)}
                        onFileUploaded={onFileUploaded}
                    /> :
                    step === STEP_POST_PROCESS ?
                    <FilePostProcessing
                        fileFullPath={file.fullPath}
                        onSuccess={onPostProcessSuccess}
                        onError={onPostProcessError}
                    /> :
                    step === STEP_SUCCESS ?
                    <BorderLinearProgress variant="determinate" value={100} sx={{width: "100%"}}/> : // SUCCESS
                    "ERROR"   // ERROR (TODO)
                }
            </TableCell>
        </TableRow>
    )
}

export default UploadStorageItemRow;
