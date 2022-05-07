import React, { useEffect, useState, useCallback } from 'react';
import {unstable_batchedUpdates} from 'react-dom'
import {isMobile} from 'react-device-detect';

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// action = "save" or "rename"
export default function SimulationNameDialog({ open, onOpenChanged, onValidate, action }) {
    const [isOpen, setIsOpen] = useState(open);
    const [okDisabled, setOkDisabled] = useState(true);
    const [password, setPassword] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    const onPasswordChanged = useCallback((event) => {
        unstable_batchedUpdates(() => {
            const newPassword = event.target.value;
            if (!newPassword || newPassword.lengh === 0) {
                setOkDisabled(true);
            } else {
                setOkDisabled(false);
            }
            setPassword(newPassword);
        });
    }, []);

    const handleClose = () => {
        unstable_batchedUpdates(() => {
            setPassword("");
            setOkDisabled(true);
            setIsOpen(false);
            onOpenChanged(false);
            setSending(false);
        });
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
        title: "Authentification",
        desc: "Veuillez vous ré-authentifier pour modifier vos informations personnelles"
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
                    <TextField
                        value={password}
                        onChange={onPasswordChanged}
                        autoFocus
                        margin="dense"
                        id="password"
                        label="Veuillez saisir votre mot de passe"
                        type="password"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="contained">
                        Annuler
                    </Button>
                    <LoadingButton
                        onClick={handleValidate}
                        variant="contained"
                        disabled={okDisabled}
                        loading={sending}
                        >
                        Valider
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </div>
    );
}
