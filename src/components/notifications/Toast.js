import React from 'react';
import { Alert } from "@mui/material";
import useToast from "./useToast";

const Toast = React.forwardRef(({toast}, ref) => {
    const {removeToast} = useToast();
    const {type = 'error', message} = toast

    return (
        <Alert
            ref={ref}
            severity={type}
            onClose={()=>removeToast(toast)}
            elevation={6}
            variant="filled"
            sx={{"white-space": "pre-wrap"}}
        >
            {message}
        </Alert>
    )
});

export default Toast;