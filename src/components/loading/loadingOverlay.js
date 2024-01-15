import React from 'react';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';

const OverlayContext = React.createContext(null);

export const OverlayProvider = ({children}) => {
    const [ overlayActive, setOverlayActive ] = React.useState(false);

    return (
        <OverlayContext.Provider
            value={{
                overlay: overlayActive,
                setOverlay: setOverlayActive
            }}
        >
            {children}
            <LoadingOverlay open={overlayActive}></LoadingOverlay>
        </OverlayContext.Provider>
    );
}

export function useOverlay() {
    const context = React.useContext(OverlayContext);
    if (context === undefined || context === null) {
        throw new Error("useOverlay must be used within an OverlayProvider");
    }
    return context;
}

const LoadingOverlay = ({ open }) => {
    return (
        <Modal
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.tooltip + 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            open={open}
        >
            <CircularProgress color="inherit" />
        </Modal>
    );
}
