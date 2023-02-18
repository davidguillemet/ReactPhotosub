import React from 'react';
import { useImageContext } from './ImageContext';
import StorageFolderRow from './StorageFolderRow';

const TableFolders = ({folders}) => {

    const imageContext = useImageContext();

    return (
        <React.Fragment>
        {
            folders.map((folder) => {
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
