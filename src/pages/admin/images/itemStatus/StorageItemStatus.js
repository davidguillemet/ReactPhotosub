import React from 'react';
import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import HtmlTooltip from 'components/htmlTooltip';

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
            <HtmlTooltip title={
                <React.Fragment>
                    <List dense={true}>
                        {
                            messages && messages.map((message, index) => 
                                <ListItem key={`${index}`}>
                                    <ListItemIcon><ErrorOutlineIcon color="error" /></ListItemIcon>
                                    <ListItemText primary={message} />
                                </ListItem>
                            )
                        }
                    </List>
                </React.Fragment>}>
                <ErrorIcon fontSize='small' color="error" />
            </HtmlTooltip>
            {
                remediation !== null && remediation.map((remediation, index) => {
                    const FixIcon = remediation.fixIcon ?? AutoFixHighOutlinedIcon;
                    return (
                        <Tooltip key={index} title={remediation.fixCaption}>
                            <IconButton onClick={remediation.onFix} sx={{m: 0}}>
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
        <Stack direction="row" alignItems="center">
            <StorageItemStatusContent {...props} />
        </Stack>
    )
}
