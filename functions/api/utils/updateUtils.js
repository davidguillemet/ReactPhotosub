module.exports = function(config) {
    const TABLE_DESTINATIONS = "destinations";
    const TABLE_SUB_GALLERIES = "sub_galleries";
    const TABLE_PORTFOLIO_CATEGORIES = "portfolioCategories";

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

    const getPortfolioCategoriesPropsToUpdate = async (element) => {
        const portfolioCategoriesColumns = await config.getTableColumns(TABLE_PORTFOLIO_CATEGORIES);
        return getPropsToUpdate(element, portfolioCategoriesColumns);
    };

    return {
        getDestinationPropsToUpdate,
        getSubGalleryPropsToUpdate,
        getPortfolioCategoriesPropsToUpdate,
    };
};
