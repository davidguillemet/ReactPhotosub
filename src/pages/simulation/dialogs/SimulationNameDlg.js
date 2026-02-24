import React, { useEffect, useState, useCallback } from 'react';
import {isMobile} from 'react-device-detect';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AutoFocusTextField from 'components/textField';

// action = "save" or "rename"
export default function SimulationNameDialog({ open, initialName, action = "save", validation, onOpenChanged, onValidate }) {
    const [isOpen, setIsOpen] = useState(open);
    const [actionName, setActionName] = useState(action);
    const [hasError, setHasError] = useState(false);
    const [okDisabled, setOkDisabled] = useState(true);
    const [name, setName] = useState(initialName || "");

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    useEffect(() => {
        setActionName(action);
    }, [action]);

    const onNameChanged = useCallback((event) => {
        const newName = event.target.value;
        if (!validation(newName, actionName)) {
            setHasError(true);
            setOkDisabled(true);
        } else {
            setHasError(false);
            setOkDisabled(false);
        }
        setName(newName);
    }, [actionName, validation]);

    const handleClose = () => {
        setIsOpen(false);
        onOpenChanged(false);
    };

    const handleValidate = () => {
        handleClose();
        if (onValidate) {
            onValidate(name.trim());
        }
    };

    const getDialogDetails = useCallback(() => {
        if (actionName === "save") {
            return {
                title: "Sauvegarder",
                desc: "Donnez un nom à votre simulation pour la sauvegarder."
            };
        } else if (actionName === "rename") {
            return {
                title: "Renommer",
                desc: "Renommez votre simulation."
            };
        } else if (actionName === "new") {
            return {
                title: "Nouvelle simulation",
                desc: "Saisissez un nom pour votre nouvelle simulation."
            };
        }
        return {
            title: "Unknown action",
            desc: "Unknown action"
        };
    }, [actionName]);

    const dialogDetails = getDialogDetails();

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
                    <AutoFocusTextField
                        value={name}
                        onChange={onNameChanged}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Nom de la simulation"
                        type="text"
                        fullWidth
                        error={hasError}
                        helperText={hasError ? (name.trim().length > 0 ? "Ce nom existe déjà" : "") : ""}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleValidate} disabled={okDisabled}>
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
