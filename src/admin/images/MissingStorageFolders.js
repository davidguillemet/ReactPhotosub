import React from 'react';
import MissingStorageItemRow from "./MissingStorageItemRow";
import { ITEM_TYPE_FOLDER } from './common';

const MissingStorageFolders = ({dbFolders}) => {

    if (dbFolders === null || dbFolders ===  undefined) {
        return null;
    }

    return (
        <React.Fragment>
        {
            dbFolders.map((folder, index) => {
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