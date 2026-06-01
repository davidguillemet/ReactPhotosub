import {
    PORTFOLIO_CATEGORY_INTENT_CREATE,
    PORTFOLIO_CATEGORY_INTENT_UPDATE,
    PORTFOLIO_CATEGORY_INTENT_DELETE,
    PORTFOLIO_CATEGORIES_KEY
} from 'utils/portfolio';

const initializeIntentHandlers = (queryClient, dataProvider) => {
    const intentHandlers = new Map();
    intentHandlers.set(PORTFOLIO_CATEGORY_INTENT_CREATE, {
        call: (formData) => {
            return dataProvider.createPortfolioCategory(formData)
        },
        updateCache: async (currentCachedData, newCategory) => currentCachedData.concat(newCategory)
    });
    intentHandlers.set(PORTFOLIO_CATEGORY_INTENT_UPDATE, {
        call: (formData) => dataProvider.updatePortfolioCategory(formData),
        updateCache: async (currentCachedData, updatedCategory, formData) => currentCachedData.filter(c => c.id !== formData.id).concat(updatedCategory)
    });
    intentHandlers.set(PORTFOLIO_CATEGORY_INTENT_DELETE, {
        call: (formData) => dataProvider.deletePortfolioCategory(formData),
        updateCache: async (currentCachedData, _, formData) => currentCachedData.filter(c => c.id !== formData.id)
    });
    return intentHandlers;
};

export const actionProperties = {
    initializeIntentHandlers,
    validateFormData: null,
    getQueryKey: (_formData) => PORTFOLIO_CATEGORIES_KEY
};
