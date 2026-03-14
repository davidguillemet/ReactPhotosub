import { ConfirmDialog } from 'dialogs';
import { useBlocker } from "react-router-dom";

const useNavigationBlocker = (blockerFunction, title, dialogContent) => {
    const blocker = useBlocker(blockerFunction);

    return {
        dialogProps: {
            open: blocker.state === 'blocked',
            onCancel: () => {
                blocker.reset();
            },
            onValidate: () => {
                blocker.proceed();
            },
            title: title ?? "Unsaved Changes",
            dialogContent: dialogContent ?? ["You have unsaved changes. Are you sure you want to leave this page?"]
        },
        DialogComponent: ConfirmDialog
    };
};

export default useNavigationBlocker;
