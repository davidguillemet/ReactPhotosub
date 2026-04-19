import { defer } from "react-router-dom";
import { getFetchDestinationKey, DESTINATION_PROPS } from "utils/destinations";

const destinationHeaderQuery = (dataProvider, destinationPath) => ({
    queryKey: getFetchDestinationKey(destinationPath, DESTINATION_PROPS.HEADER),
    queryFn: () => dataProvider.getDestinationDetailsFromPath(destinationPath)
});
const destinationImagesQuery = (dataProvider, destinationPath) => ({
    queryKey: getFetchDestinationKey(destinationPath, DESTINATION_PROPS.IMAGES),
    queryFn: () => dataProvider.getDestinationImagesFromPath(destinationPath)
});

const getDestinationHeader = async (queryClient, dataProvider, destinationPath) => {
    const query = destinationHeaderQuery(dataProvider, destinationPath);
    return queryClient.ensureQueryData(query);
};
const getDestinationImages = async (queryClient, dataProvider, destinationPath) => {
    const query = destinationImagesQuery(dataProvider, destinationPath);
    return queryClient.ensureQueryData(query);
};

const destinationLoaderFactory = (queryClient, dataProvider) => async ({ request, params }) => {
    // when migrating to react-router V7, just remove the defer and return the promise directly from the loader,
    // react-router will automatically defer it and stream the response as the data is loaded,
    // no need to use defer in the loader itself.
    const { year, title } = params;
    const destinationPath = `${year}/${title}`;
    return defer({
        destinationHeader: getDestinationHeader(queryClient, dataProvider, destinationPath),
        destinationImages: getDestinationImages(queryClient, dataProvider, destinationPath),
    });
};

export const loaderFactory = destinationLoaderFactory;