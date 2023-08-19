import React from 'react';
import { useImageContext } from './ImageContext';
import StorageFolderRow from './StorageFolderRow';

const sortAscending = (f1, f2) => f1.name.localeCompare(f2.name);
const sortDescending = (f1, f2) => f2.name.localeCompare(f1.name);

const TableFolders = () => {

    const imageContext = useImageContext();

    if (imageContext.rows.folders === null) {
        return null;
    }

    // Sort in reverse order only for the first level (destination years)
    const sortFunction = imageContext.isRoot ? sortDescending : sortAscending;

    return (
        <React.Fragment>
        {
            imageContext.rows.folders.sort(sortFunction).map((folder) => {
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
