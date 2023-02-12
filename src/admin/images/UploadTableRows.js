import React from 'react';
import UploadStorageItemRow from './UploadStorageItemRow';

const maxParallelUpload = 5;

const UploadTableRows = ({files}) => {

    if (files === null || files.length === 0) {
        return null;
    }

    return (
        <React.Fragment>
        {
            files.map((file, index) => {
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
