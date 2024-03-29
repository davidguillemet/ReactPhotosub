import React from 'react';
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
                zIndex: (theme) => theme.zIndex.snackbar,
                width: '100%',
                maxWidth: '600px',
                px: (theme) => theme.spacing(1),
                my: (theme) => theme.spacing(1)
            }}
            spacing={2}
            id="DynamicNotifications"
        >
            <TransitionGroup component={null}>
                {
                    toasts.map((toast, index) => {
                        const toastRef = React.createRef(null);
                        return (
                            <CSSTransition
                                key={toast.__id}
                                nodeRef={toastRef}
                                timeout={200}
                                classNames="notification"
                            >                
                                <Toast ref={toastRef} key={index} toast={toast} />
                            </CSSTransition>
                        )
                    })
                }
            </TransitionGroup>
        </Stack>
    )
}

export default ToastNotifications;