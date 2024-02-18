import React from 'react';

const GroupContext = React.createContext(null);

export const GroupContextProvider = ({group, children}) => {
    return (
        <GroupContext.Provider value={group}>
          { children }
        </GroupContext.Provider>
    )
}

export function useGroupContext() {
    const context = React.useContext(GroupContext);
    if (context === undefined || context === null) {
        throw new Error("useGroupContext must be used within an GroupContextProvider");
    }
    return context;
}

