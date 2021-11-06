import {isMobile} from 'react-device-detect';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function SimulationDeletionDialog({ open, name, onOpenChanged, onValidate }) {

    const handleClose = () => {
        onOpenChanged(false);
    };

    const handleValidate = () => {
        handleClose();
        if (onValidate) {
            onValidate();
        }
    };

    return (
        <div>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                open={open}
                onClose={handleClose}
            >
                <DialogTitle id="form-dialog-title">Suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>{`Confirmez-vous la supression de la simulation '${name}' ?`}</DialogContentText>
                    <DialogContentText>Attention, cette action est irreversible.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="outlined">
                        Annuler
                    </Button>
                    <Button onClick={handleValidate} color="primary" variant="outlined">
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
