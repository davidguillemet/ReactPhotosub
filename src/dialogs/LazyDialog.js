import React from 'react';
import {isMobile} from 'react-device-detect';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useTranslation } from '../utils';
import LazyContent from './LazyContent';

const LazyDialog = ({path, title, open, handleClose}) => {

    const t = useTranslation("dialogs");

    return (
        <Dialog
            fullScreen={isMobile}
            fullWidth={true}
            open={open}
            onClose={handleClose}
            sx={{
                textAlign: 'center'
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent
                sx={{
                    px: isMobile ? 1 : 3
                }}
            >
            { open && <LazyContent path={path} /> }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined" size={ isMobile ? "small" : "large"}>{t("button::close")}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default LazyDialog;