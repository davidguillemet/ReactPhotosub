import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslation } from 'utils';
import { useAuthContext } from 'components/authentication';

// The version baked into THIS bundle at build time.
// Set by build4deploy: REACT_APP_VERSION=$(git rev-parse --short HEAD) ...
const BOOT_VERSION = process.env.REACT_APP_VERSION;
const POLL_MS = 5 * 60 * 1000; // 5 minutes

export function useVersionCheck() {
    const [updateAvailable, setUpdateAvailable] = React.useState(false);
    const busy = React.useRef(false);

    React.useEffect(() => {
        // No baked version (e.g. dev / local build) -> nothing to compare against.
        if (!BOOT_VERSION || updateAvailable) return undefined;
        let cancelled = false;

        const check = async () => {
            if (busy.current) return;
            busy.current = true;
            try {
                const res = await fetch('/version.json', { cache: 'no-store' }); // must NOT be cached
                if (res.ok) {
                    const { version } = await res.json();
                    if (!cancelled && version && version !== BOOT_VERSION) {
                        setUpdateAvailable(true);
                    }
                }
            } catch {
                /* offline / transient — ignore and retry on the next tick */
            } finally {
                busy.current = false;
            }
        };

        const intervalId = setInterval(check, POLL_MS);
        const onVisible = () => {
            if (document.visibilityState === 'visible') check();
        };
        document.addEventListener('visibilitychange', onVisible);
        check(); // check immediately on mount

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [updateAvailable]);

    return updateAvailable;
}

export const UpdateNotifier = () => {
    const t = useTranslation("components.updateNotifier");
    const authContext = useAuthContext();
    const updateAvailable = useVersionCheck();

    // Only show update notifications to admin users at the beginning, before making it available to all users
    if (!authContext.admin) return null;
    if (!updateAvailable) return null;

    return (
        <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert
                severity="info"
                variant="filled"
                action={
                    <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                        {t("newVersion.refresh")}
                    </Button>
                }
            >
                {t("newVersion.message")}
            </Alert>
        </Snackbar>
    );
};
