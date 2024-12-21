import {isMobile} from 'react-device-detect';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'utils';

export default function ConfirmDialog({
    open,
    title,
    dialogContent,
    onOpenChanged,
    onValidate
}) {
    const t = useTranslation("dialogs");
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
                <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {
                        dialogContent.map((line, index) => <DialogContentText key={index}>{line}</DialogContentText>)
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} >
                    {t("cancel")}
                    </Button>
                    <Button onClick={handleValidate} >
                    {t("validate")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
