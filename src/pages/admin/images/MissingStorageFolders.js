import React from 'react';
import MissingStorageItemRow from "./MissingStorageItemRow";
import { ITEM_TYPE_FOLDER } from './common';
import { useImageContext } from './ImageContext';

const MissingStorageFolders = () => {

    const imageContext = useImageContext();

    if (imageContext.rows.missingFolders === null) {
        return null;
    }

    return (
        <React.Fragment>
        {
            imageContext.rows.missingFolders.map((folder, index) => {
                return <MissingStorageItemRow
                            key={folder.name}
                            itemName={folder.name}
                            type={ITEM_TYPE_FOLDER}
                            dbIssue={true}
                        />
            })
        }
        </React.Fragment>
    )
}

export default MissingStorageFolders;