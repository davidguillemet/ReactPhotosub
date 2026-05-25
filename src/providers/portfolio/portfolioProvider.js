import React from 'react';

const PortfolioContext = React.createContext(null);

export const PortfolioProvider = ({ portfolio, children }) => {

    const portfolioContextValue = React.useMemo(() => {
        const portFolioMap = new Map();
        if (portfolio) {
            portfolio.forEach(image => {
                portFolioMap.set(image.id, image);
            });
        }
        return {
            isInPortfolio: (image) => {
                return portFolioMap.has(image.id);
            },
            portfolio
        }
    }, [portfolio]);

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

