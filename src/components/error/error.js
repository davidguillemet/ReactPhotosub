import React from 'react';
import { useAsyncError, useRouteError, isRouteErrorResponse } from 'react-router';
import { Alert, AlertTitle, Box } from '@mui/material';
import { useTranslation } from 'utils';

import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotFound from 'pages/notFound';


const ErrorAlert = ({maxWidth}) => {
    const t = useTranslation("components.error");
    const asyncError = useAsyncError();
    const routeError = useRouteError();
    const hasRouterError = !!asyncError || !!routeError;
    const [ showDetails, setShowDetails ] = React.useState(false);

    const errorMessage = 
        asyncError ? asyncError.message :
        isRouteErrorResponse(routeError) ? (routeError.data || routeError.statusText) :
        routeError.cause?.detail || routeError.message || t("unknownError");

    const onExpandDetails = React.useCallback(() => {
        setShowDetails(show => !show);
    }, []);

    if (asyncError?.status === 404) {
        return <NotFound />
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            px: 1,
            mt: 1
        }}>
            <Alert
                severity="error"
                sx={{my: 0, py: 0}}
                action={ hasRouterError &&
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={onExpandDetails}
                    >
                        <ExpandMoreIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                <AlertTitle>{t("caption")}</AlertTitle>
                { 
                    showDetails && errorMessage
                }
            </Alert>
        </Box>
    )
}

export default ErrorAlert;