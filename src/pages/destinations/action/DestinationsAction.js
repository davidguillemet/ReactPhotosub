import {
    isDestinationKey,
    DESTINATION_INTENT_CREATE,
    DESTINATION_INTENT_UPDATE,
    DESTINATION_INTENT_DELETE
} from 'utils/destinations';

const initializeIntentHandlers = (queryClient, dataProvider) => {
    const intentHandlers = new Map();
    intentHandlers.set(DESTINATION_INTENT_CREATE, {
        call: (formData) => {
            return dataProvider.createDestination(formData)
        },
        updateCache: async (currentCachedData, newDestinations) => newDestinations
    });
    intentHandlers.set(DESTINATION_INTENT_UPDATE, {
        call: (formData) => dataProvider.updateDestination(formData),
        updateCache: async (currentCachedData, newDestinations, formData) => {
            await queryClient.invalidateQueries({
                // Invalidate all queries related to destination path "year/title"
                predicate: (query) => {
                    const shouldInvalidated = isDestinationKey(query.queryKey, formData.path);
                    return shouldInvalidated;
                },
                refetchType: 'all'
            })
            return newDestinations;
        }
    });
    intentHandlers.set(DESTINATION_INTENT_DELETE, {
        call: (formData) => dataProvider.deleteDestination(formData.id),
        updateCache: async (currentCachedDestinations, _callResult, formData) => {
            await queryClient.invalidateQueries({
                // Invalidate all queries related to destination path "year/title"
                predicate: (query) => {
                    const shouldInvalidated = isDestinationKey(query.queryKey, formData.path);
                    return shouldInvalidated;
                },
                refetchType: 'all'
            })
            return currentCachedDestinations.filter(d => d.id !== formData.id);
        }
    });
    return intentHandlers;
};

export const actionProperties = {
    initializeIntentHandlers,
    validateFormData: null,
    getQueryKey: (_formData) => ['destinations']
};
