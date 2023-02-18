import React from 'react';
import { useUploadContext } from './UploadContext';
import UploadStorageItemRow from './UploadStorageItemRow';

const maxParallelUpload = 5;

const UploadTableRows = () => {

    const uploadContext = useUploadContext();

    if (uploadContext.files === null || uploadContext.files.length === 0) {
        return null;
    }

    return (
        <React.Fragment>
        {
            uploadContext.files.map((file, index) => {
                return <UploadStorageItemRow
                            key={file.name}
                            file={file}
                            start={index < maxParallelUpload}
                        />
            })
        }
        </React.Fragment>
    )
}

export default UploadTableRows;
