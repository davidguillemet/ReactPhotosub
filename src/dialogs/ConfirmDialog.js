import {isMobile} from 'react-device-detect';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function ConfirmDialog({
    open,
    title,
    dialogContent,
    actions = { cancel: "Annuler", validate: "Valider" },
    onOpenChanged,
    onValidate
}) {

    const handleClose = () => {
        onOpenChanged(false);
    };

    const handleValidate = () => {
        if (onValidate) {
            onValidate().then(() => {
                handleClose();
            })
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
                <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {
                        dialogContent.map((line, index) => <DialogContentText key={index}>{line}</DialogContentText>)
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="outlined">
                    {actions['cancel']}
                    </Button>
                    <Button onClick={handleValidate} color="primary" variant="outlined">
                    {actions['validate']}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
