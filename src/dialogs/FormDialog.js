import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {isMobile} from 'react-device-detect';

const FormDialog = ({title, open, onClose, children, maxWidth = 'lg'}) => {

    const [isOpen, setIsOpen] = React.useState(open);

    React.useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleClose = React.useCallback(() => {
        setIsOpen(false);
        onClose();
    }, [onClose]);

    return (
        <Dialog
            fullScreen={isMobile}
            maxWidth={maxWidth}
            fullWidth={true}
            open={isOpen}
            onClose={handleClose}
        >
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>

            <DialogContent>
                {
                    // Inject onCancel property for each child
                    React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { onCancel: onClose });
                        }
                        return child;
                    })
                }
            </DialogContent>

        </Dialog>
    )
}

export default function useFormDialog(onClose = null) {

    const [ isOpen, setIsOpen ] = React.useState(false);

    const openDialog = React.useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeDialog = React.useCallback(() => {
        setIsOpen(false);
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const dialogProps = {
        open: isOpen,
        onClose: closeDialog
    };

    return {
        dialogProps,
        openDialog,
        FormDialog
    };
};