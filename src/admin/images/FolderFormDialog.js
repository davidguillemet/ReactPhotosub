import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {unstable_batchedUpdates} from 'react-dom';
import {isMobile} from 'react-device-detect';
import FolderForm from './FolderForm';

const FolderFormDialog = ({open, onClose}) => {

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

    return (
        <div>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                open={isOpen}
                onClose={handleClose}
            >
                <DialogTitle id="form-dialog-title">Création d'un répertoire</DialogTitle>

                <DialogContent>
                    <FolderForm onCancel={handleClose} />
                </DialogContent>

            </Dialog>
        </div>
    )
}

export default FolderFormDialog;