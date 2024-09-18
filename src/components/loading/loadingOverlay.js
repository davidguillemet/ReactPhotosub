import React from 'react';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import { withTheme } from '@mui/styles';

const OverlayContext = React.createContext(null);

const zIndexFromTheme = (theme) => {
    return theme.zIndex.tooltip + 1;
};

export const OverlayProvider = withTheme(({children, theme}) => {
    const [ overlayActive, setOverlayActive ] = React.useState(false);

    return (
        <OverlayContext.Provider
            value={{
                overlay: overlayActive,
                setOverlay: setOverlayActive,
                zIndex: zIndexFromTheme(theme)
            }}
        >
            {children}
            <LoadingOverlay open={overlayActive}></LoadingOverlay>
        </OverlayContext.Provider>
    );
});

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
                zIndex: (theme) => zIndexFromTheme(theme),
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
