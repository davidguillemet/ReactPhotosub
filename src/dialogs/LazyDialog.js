import React, { useMemo } from 'react';
import {isMobile} from 'react-device-detect';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Loading } from '../components/hoc';
import Button from '@mui/material/Button';
import { lazy } from 'react';

const importLazyModule = path => {
    return lazy(() => import(`./${path}`).catch(() => import(`./ModuleNotFound`)));
}

const LazyDialog = ({path, title, open, handleClose}) => {

    const LazySummaryView = useMemo(() => {
        return open === false ? null : importLazyModule(path);
    }, [path, open]);

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
            { open &&
                <React.Suspense fallback={<Loading/>}>
                    <LazySummaryView name={path}/>
                </React.Suspense>
            }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined" size={ isMobile ? "small" : "large"}>Fermer</Button>
            </DialogActions>
        </Dialog>
    )
}

export default LazyDialog;