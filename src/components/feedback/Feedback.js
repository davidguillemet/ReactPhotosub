import React, { useEffect, useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
        <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={feedback.severity}>
            {feedback.message}
            </Alert>
      </Snackbar>
    );
};

export default FeedbackMessage;
