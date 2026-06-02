import React from 'react';
import { parsePortfolioCategoryImageId } from 'utils/portfolio';

const PortfolioContext = React.createContext(null);

export const PortfolioProvider = ({ portfolio, children }) => {

    const portfolioObservers = React.useRef([]);

    const subscribe = React.useCallback((fn) => {
        portfolioObservers.current.push(fn);
    }, []);

    const unsubscribe = React.useCallback((fn) => {
        portfolioObservers.current = portfolioObservers.current.filter(observer => observer !== fn);
    }, []);

    const notifyObservers = React.useCallback((idArray, action) => {
        portfolioObservers.current.forEach(observer => observer(idArray, action));
    }, []);

    const portfolioContextValue = React.useMemo(() => {
        const portFolioMap = new Map();
        if (portfolio) {
            portfolio.forEach(image => {
                portFolioMap.set(image.id, image);
            });
        }
        return {
            isInPortfolio: (image) => {
                const imageId = parsePortfolioCategoryImageId(image.id);
                return portFolioMap.has(imageId);
            },
            portfolio,
            subscribe,
            unsubscribe,
            notifyObservers
        }
    }, [portfolio, subscribe, unsubscribe, notifyObservers]);

    return (
        <PortfolioContext.Provider value={portfolioContextValue}>
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio() {
    const context = React.useContext(PortfolioContext);
    if (context === undefined || context === null) {
        throw new Error("usePortfolio must be used within a PortfolioProvider");
    }
    return context;
}

