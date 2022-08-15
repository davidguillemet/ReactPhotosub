import { Alert } from "@mui/material";
import useToast from "./useToast";

const Toast = ({toast}) => {
    const {removeToast} = useToast();
    const {type = 'error', message} = toast

    return (
        <Alert severity={type} onClose={()=>removeToast(toast)} elevation={6} variant="filled">
            {message}
        </Alert>
    )
}

export default Toast;