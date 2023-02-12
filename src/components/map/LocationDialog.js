import React from 'react';
import {isMobile} from 'react-device-detect';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { LocationsMap } from './DestinationsMap';

const LocationDialog = ({locations, open, handleClose}) => {

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            open={open}
            onClose={handleClose}
            sx={{
                '& .MuiDialog-paper': {
                    height: '100%'
                }
            }}
        >
            <DialogContent
                sx={{
                    mt: isMobile ? 0 : 2,
                    px: isMobile ? 0 : 2,
                    py: 0,
                    height: '100%'
                }}
            >
            { open &&
                <LocationsMap locations={locations} isFullScreen={true} onClose={handleClose} />
            }
            </DialogContent>
        </Dialog>
    )
}

export default LocationDialog;