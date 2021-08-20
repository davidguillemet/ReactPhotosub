import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>{`Confirmez-vous la supression de la simulation '${name}' ?`}</DialogContentText>
                    <DialogContentText>Cette action est irreversible.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleValidate} color="primary">
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
