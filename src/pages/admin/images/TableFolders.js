import React from 'react';
import { useImageContext } from './ImageContext';
import StorageFolderRow from './StorageFolderRow';

const TableFolders = () => {

    const imageContext = useImageContext();

    if (imageContext.rows.folders === null) {
        return null;
    }

    return (
        <React.Fragment>
        {
            imageContext.rows.folders.map((folder) => {
                const isItemSelected = imageContext.isSelected(folder);
                return <StorageFolderRow
                            key={folder.name}
                            folder={folder}
                            selected={isItemSelected}
                        />
            })
        }
        </React.Fragment>
    )
}

export default TableFolders;
