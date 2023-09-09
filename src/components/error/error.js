import { Alert, Box } from '@mui/material';
import { useTranslation } from 'utils';

const ErrorAlert = ({maxWidth}) => {
    const t = useTranslation("components.error");
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            px: 1
        }}>
            <Alert severity="error" variant="filled" sx={{my: 0, py: 0}}>{t("caption")}</Alert>
        </Box>
    )
}

export default ErrorAlert;