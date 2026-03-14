import { defer } from "react-router-dom"; // Remove it with react-router v7 when we can return the promise directly from the loader without using defer, react-router will automatically defer it and stream the response as the data is loaded, no need to use defer in the loader itself.
import { uniqueID, shuffleArray } from 'utils';

const processSlideshowData = async (data) => {
    const processedData = shuffleArray(data).map(image => {
        return {
            ...image,
            ...(process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true' && {
                src: image.src.replace("127.0.0.1", process.env.REACT_APP_DEV_HOST)
            }),
            id: uniqueID()
        }
    });
    return processedData;
};

const slideShowQuery = (dataProvider) => ({
    queryKey: ['homeslideshow'],
    queryFn: () => dataProvider.getImageDefaultSelection().then(processSlideshowData)
});

const getSlideshowImages = async (queryClient, dataProvider) => {
    const query = slideShowQuery(dataProvider);
    return queryClient.ensureQueryData(query);
}

const SlideshowLoader = (queryClient, dataProvider) => async ({ request, params }) => {
    // when migrating to react-router V7, just remove the defer and return the promise directly from the loader,
    // react-router will automatically defer it and stream the response as the data is loaded,
    // no need to use defer in the loader itself. 
    return defer({
        images: getSlideshowImages(queryClient, dataProvider)
    });
};

export const loader = SlideshowLoader;
