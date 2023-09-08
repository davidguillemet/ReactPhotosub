import {isMobile} from 'react-device-detect';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'utils';

export default function SimulationDeletionDialog({ open, name, onOpenChanged, onValidate }) {

    const t = useTranslation("pages.composition");

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
                <DialogTitle id="form-dialog-title">{t("dlgTitle:delete")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t("dlg:confirm1", name)}</DialogContentText>
                    <DialogContentText>{t("dlg:confirm2", name)}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="outlined">
                        {t("dlg:cancelDeletion")}
                    </Button>
                    <Button onClick={handleValidate} color="primary" variant="outlined">
                        {t("dlg:validateDeletion")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
