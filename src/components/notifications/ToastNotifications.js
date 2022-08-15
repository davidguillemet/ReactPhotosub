import { Stack } from "@mui/material";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useToasts } from "./useToast";
import Toast from "./Toast";
import './notificationStyles.css';

const ToastNotifications = (props) => {
    const toasts = useToasts()

    return (
        <Stack
            sx={{
                position: 'fixed',
                bottom: (theme) => theme.spacing(2),
                zIndex: (theme) => theme.zIndex.tooltip,
                width: '100%',
                maxWidth: '600px',
                p: (theme) => theme.spacing(1)
            }}
            spacing={2}
            id="DynamicNotifications"
        >
            <TransitionGroup component={null}>
                {
                    toasts.map((toast, index) => {
                        return (
                            <CSSTransition
                                key={toast._id}
                                timeout={200}
                                classNames="notification"
                            >                
                                <Toast key={index} toast={toast} />
                            </CSSTransition>
                        )
                    })
                }
            </TransitionGroup>
        </Stack>
    )
}

export default ToastNotifications;