import React, { useEffect, useState, useCallback } from 'react';
import {unstable_batchedUpdates} from 'react-dom'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// action = "save" or "rename"
export default function SimulationNameDialog({ open, action = "save", validation, onOpenChanged, onValidate }) {
    const [isOpen, setIsOpen] = useState(open);
    const [actionName, setActionName] = useState(action);
    const [hasError, setHasError] = useState(false);
    const [okDisabled, setOkDisabled] = useState(true);
    const [name, setName] = useState("");

    useEffect(() => {
        setIsOpen(open);
    }, [open])

    useEffect(() => {
        setActionName(action);
    }, [action]);

    const onNameChanged = useCallback((event) => {
        unstable_batchedUpdates(() => {
            const newName = event.target.value;
            if (!validation(newName, actionName)) {
                setHasError(true);
                setOkDisabled(true);
            } else {
                setHasError(false);
                setOkDisabled(false);
            }
            setName(newName);
        });
    }, [actionName, validation]);

    const handleClose = () => {
        setName("");
        setOkDisabled(true);
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
            <Dialog open={isOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{dialogDetails.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogDetails.desc}</DialogContentText>
                    <TextField
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
                    <Button onClick={handleClose} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleValidate} color="primary" disabled={okDisabled}>
                        Valider
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
