import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {unstable_batchedUpdates} from 'react-dom';
import {isMobile} from 'react-device-detect';
import LocationForm from './LocationForm';

const EditLocationDialog = ({open, location, locations, regions, onClose, onNewLocation}) => {

    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    const handleClose = React.useCallback(() => {
        unstable_batchedUpdates(() => {
            setIsOpen(false);
            onClose();
        });
    }, [onClose]);

    const getDialogTitle = React.useCallback(() => {
        if (location === null || location.id === undefined) {
            return "Nouveau lieu"
        } else {
            return "Modifier le lieu"
        }
    }, [location]);

    return (
        <div>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                open={isOpen}
                onClose={handleClose}
            >
                <DialogTitle id="form-dialog-title">{getDialogTitle()}</DialogTitle>

                <DialogContent>
                    <LocationForm
                        location={location}
                        locations={locations}
                        regions={regions}
                        onCancel={handleClose}
                        onNewLocation={onNewLocation}
                    />
                </DialogContent>

            </Dialog>
        </div>
    )
}

export default EditLocationDialog;