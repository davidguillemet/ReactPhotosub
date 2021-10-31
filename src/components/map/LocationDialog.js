import React, { useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import DestinationsMap from '.';

const LocationDialog = ({destinations, open, handleClose}) => {

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
                <DestinationsMap destinations={destinations} isFullScreen={true} />
            }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined" size={ isMobile ? "small" : "large"}>Fermer</Button>
            </DialogActions>
        </Dialog>
    )
}

export default LocationDialog;