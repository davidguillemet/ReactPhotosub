module.exports = function(config) {
    const TABLE_DESTINATIONS = "destinations";
    const TABLE_SUB_GALLERIES = "sub_galleries";

    const getPropsToUpdate = (element, databaseColumns) => {
        const elementUpdate = {};
        databaseColumns.forEach((column) => {
            if (Object.hasOwn(element, column)) {
                elementUpdate[column] = element[column];
            }
        });
        return elementUpdate;
    };

    const getDestinationPropsToUpdate = async (element) => {
        const destinationColumns = await config.getTableColumns(TABLE_DESTINATIONS);
        return getPropsToUpdate(element, destinationColumns);
    };

    const getSubGalleryPropsToUpdate = async (element) => {
        const subGalleryColumns = await config.getTableColumns(TABLE_SUB_GALLERIES);
        return getPropsToUpdate(element, subGalleryColumns);
    };

    return {
        getDestinationPropsToUpdate,
        getSubGalleryPropsToUpdate,
    };
};
