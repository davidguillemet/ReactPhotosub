export const ITEM_TYPE_FILE = 'item::file';
export const ITEM_TYPE_FOLDER = 'item::folder';

export const FOLDER_TYPE = {
    none: 'folder::none',
    root: 'folder::root',
    destination: 'folder::destination',
    legacy: 'folder::legacy',
    interior: 'folder::interior',
    homeSlideshow: 'folder:homeSlideshow'
};

const _foldersWithThumbnails = [
    FOLDER_TYPE.destination,
    FOLDER_TYPE.interior,
    FOLDER_TYPE.homeSlideshow
];

const _foldersWithImages = _foldersWithThumbnails;

const _foldersWithDatabaseImage = [
    FOLDER_TYPE.destination
];

const _foldersWithUpload = [
    FOLDER_TYPE.destination,
    FOLDER_TYPE.homeSlideshow,
    FOLDER_TYPE.interior,
    FOLDER_TYPE.legacy
];

export const requireThumbnails = (folderType) => {
    return _foldersWithThumbnails.includes(folderType);
}

export const hasDatabaseImage = (folderType) => {
    return _foldersWithDatabaseImage.includes(folderType);
}

export const containsImage = (folderType) => {
    return _foldersWithImages.includes(folderType);
}

export const canUpload = (folderType) => {
    return _foldersWithUpload.includes(folderType);
}
