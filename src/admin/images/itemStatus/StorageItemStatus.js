import React from 'react';
import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

export const STATUS_UNKNOWN = "unknown";
export const STATUS_SUCCESS = "success";
export const STATUS_PENDING = "pending";
export const STATUS_NOT_READY = "notReady";
export const STATUS_NOT_AVAILABLE = "notAvailable";
export const STATUS_ERROR = "error";

export function getItemConsolidatedStatus() {
    const statusArray = Array.from(arguments);
    if (statusArray.every(status => status === STATUS_SUCCESS)) {
        return "success";
    } else if (statusArray.some(status => status === STATUS_ERROR)) {
        return "error";
    } else {
        return "warning";
    }
}

const StorageItemStatusContent = ({status, message, errorIcon, remediation}) => {
    const ErrorIcon = errorIcon ?? ErrorOutlineIcon;

    if (status === STATUS_UNKNOWN) {
        return "";
    }
    if (status === STATUS_NOT_AVAILABLE) {
        return " - ";
    }
    if (status === STATUS_PENDING || status === STATUS_NOT_READY || status === STATUS_UNKNOWN) {
        return <CircularProgress size={20} />;
    }
    if (status === STATUS_SUCCESS) {
        return <CheckCircleOutlineIcon fontSize='medium' color="success" />;
    }
    // STATUS_ERROR
    return (
        <React.Fragment>
            <Tooltip title={message}>
                <ErrorIcon fontSize='medium' color="error" />
            </Tooltip>
            {
                remediation.map((remediation, index) => {
                    const FixIcon = remediation.fixIcon ?? AutoFixHighOutlinedIcon;
                    return (
                        <Tooltip key={index} title={remediation.fixCaption}>
                            <IconButton onClick={remediation.onFix} sx={{m: 0}}>
                                <FixIcon fontSize='medium' />
                            </IconButton>
                        </Tooltip>
                    )
                })
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
