const slideShowQuery = async (dataProvider, firebaseProvider) => {
    return {
        queryKey: ['portfolio'],
        queryFn: () => dataProvider.getPortfolio()
    };
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
