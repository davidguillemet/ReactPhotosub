import React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useUploadContext } from './UploadContext';

const FileUploadSelection = React.forwardRef(({caption, disabled}, ref) => {

    const uploadContext = useUploadContext();

    const handleFileSelection = (event) => {
        const { target: { files } } = event;
        const _files = [];
        for (let i = 0; i < files.length; i++) {
            _files.push(files[i]);
        }
        // Reset the input value to be able to upload the same file again
        // For example after having removed it
        event.target.value = "";
        uploadContext.setUploadSelection(_files);
    }

    return (
        <React.Fragment>
            <input
                accept="image/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={handleFileSelection}
                disabled={disabled}
                style={{
                    display: 'none'
                }}
                ref={ref}
            />
            <label htmlFor="contained-button-file">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={disabled}
                >
                    {caption}
                </Button>
            </label>
        </React.Fragment>
    );
});

export default FileUploadSelection;
