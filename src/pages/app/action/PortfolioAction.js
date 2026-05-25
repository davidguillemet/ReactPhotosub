
import { PORTFOLIO_INTENT_ADD, PORTFOLIO_INTENT_REMOVE } from "utils/portfolio";

const initializeIntentHandlers = (queryClient, dataProvider) => {
    const intentHandlers = new Map();
    intentHandlers.set(PORTFOLIO_INTENT_ADD, {
        call: async (formData) => {
            const { ids } = formData;
            return dataProvider.addToPortfolio(ids);
        },
        updateCache: async (currentCachedData, newPortfolioItems, _formData) => ([
            // Return the current portfolio, with the new items added
            ...currentCachedData,
            ...newPortfolioItems,
        ])
    });
    intentHandlers.set(PORTFOLIO_INTENT_REMOVE, {
        call: async (formData) => {
            const { ids } = formData;
            return dataProvider.removeFromPortfolio(ids);
        },
        updateCache: async (currentCachedData, _unusedCallResult, _formData) => ([
            // Return the current by filtering the removed images
            ...currentCachedData.filter(item => !_formData.ids.includes(item.id))
        ])
    });
    return intentHandlers;
}

export const actionProperties = {
    initializeIntentHandlers,
    validateFormData: null,
    getQueryKey: (_formData) => ['portfolio']
};
