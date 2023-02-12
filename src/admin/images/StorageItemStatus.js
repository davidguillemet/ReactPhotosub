import React from 'react';
import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

export const STATUS_SUCCESS = "success";
export const STATUS_PENDING = "pending";
export const STATUS_NOT_READY = "notReady";
export const STATUS_NOT_AVAILABLE = "notAvailable";
export const STATUS_ERROR = "error";
export const STATUS_NO_THUMBS_FOLDER = "noThumbsFolder";

export const getItemConsolidatedStatus = (statusArray) => {
    if (statusArray.every(status => status === STATUS_SUCCESS)) {
        return "success";
    } else if (statusArray.some(status => status === STATUS_ERROR)) {
        return "error";
    } else {
        return "warning";
    }
}

const StorageItemStatusContent = ({status, message, onFix, fixCaption, fixIcon}) => {
    const FixIcon = fixIcon ?? AutoFixHighOutlinedIcon;

    if (status === STATUS_NOT_AVAILABLE) {
        return " - ";
    }
    if (status === STATUS_PENDING || status === STATUS_NOT_READY) {
        return <CircularProgress size={20} />;
    }
    if (status === STATUS_SUCCESS) {
        return <CheckCircleOutlineIcon fontSize='medium' color="success" />;
    }
    // STATUS_NO_THUMBS_FOLDER | STATUS_ERROR
    return (
        <React.Fragment>
            <Tooltip title={message}>
                <ErrorOutlineIcon fontSize='medium' color="error" />
            </Tooltip>
            {
                onFix &&
                <Tooltip title={fixCaption}>
                    <IconButton onClick={onFix} sx={{m: 0}}>
                        <FixIcon fontSize='medium' />
                    </IconButton>
                </Tooltip>
            }
        </React.Fragment>
    )
}

export const StorageItemStatus = (props) => {
    return (
        <Stack direction="row" alignItems="center">
            <StorageItemStatusContent {...props} />
        </Stack>
    )
}
