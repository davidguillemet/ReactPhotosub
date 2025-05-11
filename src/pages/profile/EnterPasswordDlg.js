import React, { useEffect, useState, useCallback } from 'react';
import {isMobile} from 'react-device-detect';

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'utils';
import { VerticalSpacing } from 'template/spacing';

// action = "save" or "rename"
export default function SimulationNameDialog({ open, onOpenChanged, onValidate, action }) {
    const t = useTranslation("pages.profile");
    const [isOpen, setIsOpen] = useState(open);
    const [okDisabled, setOkDisabled] = useState(true);
    const [password, setPassword] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    const onPasswordChanged = useCallback((event) => {
        const newPassword = event.target.value;
        if (!newPassword || newPassword.lengh === 0) {
            setOkDisabled(true);
        } else {
            setOkDisabled(false);
        }
        setPassword(newPassword);
    }, []);

    const handleClose = () => {
        setPassword("");
        setOkDisabled(true);
        setIsOpen(false);
        onOpenChanged(false);
        setSending(false);
    };

    const handleValidate = () => {
        if (onValidate) {
            onValidate(password.trim(), action)
            .then(() => {
                handleClose();
            })
        }
    };

    const dialogDetails = {
        title: t("title:authDialog"),
        desc: t("desc:authDialog")
    };

    return (
        <div>
            <Dialog
                fullScreen={isMobile}
                fullWidth={true}
                open={isOpen}
                onClose={handleClose}
            >
                <DialogTitle id="form-dialog-title">{dialogDetails.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogDetails.desc}</DialogContentText>
                    <VerticalSpacing factor={2} />
                    <TextField
                        value={password}
                        onChange={onPasswordChanged}
                        autoFocus
                        variant="outlined"
                        margin="dense"
                        id="password"
                        label={t("field:authDialog")}
                        type="password"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {t("btn:cancel")}
                    </Button>
                    <LoadingButton
                        onClick={handleValidate}
                        disabled={okDisabled}
                        loading={sending}
                    >
                        {t("btn:validate")}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}
