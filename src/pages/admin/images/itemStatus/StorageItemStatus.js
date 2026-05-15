import React from 'react';
import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

export const STATUS_UNKNOWN = "unknown";
export const STATUS_SUCCESS = "success";
export const STATUS_PENDING = "pending";
export const STATUS_NOT_READY = "notReady";
export const STATUS_NOT_AVAILABLE = "notAvailable";
export const STATUS_ERROR = "error";

export function getItemConsolidatedStatus() {
    const statusArray = Array.from(arguments);
    if (statusArray.every(status => status === STATUS_SUCCESS || status === STATUS_NOT_AVAILABLE)) {
        return "success";
    } else if (statusArray.some(status => status === STATUS_ERROR)) {
        return "error";
    } else {
        return "warning";
    }
}

const StorageItemStatusContent = ({status, messages, errorIcon, remediation = null}) => {
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
        return <CheckCircleOutlineIcon fontSize='small' color="success" />;
    }
    // STATUS_ERROR = the property messages is expected as an array of error messages
    return (
        <React.Fragment>
            <Tooltip title={
                <React.Fragment>
                    <List dense={true} sx={{p: 0, m: 0}}>
                        {
                            messages && messages.map((message, index) => 
                                <ListItem key={`${index}`} sx={{p: 0}}>
                                    <ListItemIcon><ErrorOutlineIcon color="error" /></ListItemIcon>
                                    <ListItemText
                                        primary={message}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontFamily: '"JetBrains Mono", ui-monospace, monospace !important',
                                                    fontSize: '0.58rem !important',
                                                    textTransform: "none !important",
                                                    color: theme => `${theme.palette.text.primary} !important`
                                                }
                                            }
                                        }}
                                    />
                                </ListItem>
                            )
                        }
                    </List>
                </React.Fragment>}>
                <ErrorIcon fontSize='small' color="error" sx={{mr: 0.5}}/>
            </Tooltip>
            {
                remediation !== null && remediation.map((remediation, index) => {
                    const FixIcon = remediation.fixIcon ?? AutoFixHighOutlinedIcon;
                    return (
                        <Tooltip key={index} title={remediation.fixCaption}>
                            <IconButton onClick={remediation.onFix} sx={{mr: 0.5, ml: 0.5}} size="small">
                                <FixIcon fontSize='small' />
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
        <Stack
            direction="row"
            sx={{
                alignItems: "center"
            }}
        >
            <StorageItemStatusContent {...props} />
        </Stack>
    );
}
