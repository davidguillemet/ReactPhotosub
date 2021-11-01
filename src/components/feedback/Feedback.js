import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const FeedbackMessage = ({severity, message}) => {

    const [feedback, setFeedback] = useState({
        severity: "success",
        message: null,
        open: false
    });

    useEffect(() => {
        setFeedback({
            severity: severity,
            message: message,
            open: message !== null
        });
    }, [severity, message]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setFeedback(prevFeedBack => {
            return {
                ...prevFeedBack,
                open: false
            }
        });
    };

    return (
        <Snackbar
            open={feedback.open}
            autoHideDuration={6000}
            onClose={handleClose}
        >
            <Alert onClose={handleClose} severity={feedback.severity} elevation={6} variant="filled">
                {feedback.message}
            </Alert>
        </Snackbar>
    );
};

export default FeedbackMessage;
