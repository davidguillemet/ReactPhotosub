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

const slideShowQuery = async (dataProvider, firebaseProvider) => {
    const portfolioEnabled = (await firebaseProvider.getConfigValue("portfolio_enabled")).asBoolean();
    if (portfolioEnabled) {
        return {
            queryKey: ['portfolio'],
            queryFn: () => dataProvider.getPortfolio()
        };
    } else {
        return {
            queryKey: ['homeslideshow'],
            queryFn: () => dataProvider.getImageDefaultSelection().then(processSlideshowData)
        };
    }
};

const getSlideshowImages = async (queryClient, dataProvider, firebaseProvider) => {
    const query = await slideShowQuery(dataProvider, firebaseProvider);
    return queryClient.ensureQueryData(query);
}

const SlideshowLoader = (queryClient, dataProvider, firebaseProvider) => async ({ request, params }) => {
    return {
        images: getSlideshowImages(queryClient, dataProvider, firebaseProvider)
    };
};

export const loaderFactory = SlideshowLoader;
