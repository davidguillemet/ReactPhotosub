import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'utils';
import {isMobile} from 'react-device-detect';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AutoFocusTextField from 'components/textField';

import { VerticalSpacing } from 'template/spacing';

// action = "save" or "rename"
export default function SimulationNameDialog({ open, initialName, action = "save", validation, onOpenChanged, onValidate }) {
    const t = useTranslation("pages.composition.simulationNameDialog");
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
                title: t("save:title"),
                desc: t("save:description")
            };
        } else if (actionName === "rename") {
            return {
                title: t("rename:title"),
                desc: t("rename:description")
            };
        } else if (actionName === "new") {
            return {
                title: t("new:title"),
                desc: t("new:description")
            };
        }
        return {
            title: t("unknownAction:title"),
            desc: t("unknownAction:description")
        };
    }, [actionName, t]);

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
                    <VerticalSpacing factor={1} />
                    <AutoFocusTextField
                        value={name}
                        onChange={onNameChanged}
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t("field:simulationName")}
                        type="text"
                        fullWidth
                        error={hasError}
                        helperText={hasError ? (name.trim().length > 0 ? t("error:nameExists") : "") : ""}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        {t("btn:cancel")}
                    </Button>
                    <Button onClick={handleValidate} disabled={okDisabled}>
                        {t("btn:validate")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
