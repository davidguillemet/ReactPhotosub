import { Alert, Box } from '@mui/material';

const ErrorAlert = ({maxWidth}) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            px: 1
        }}>
            <Alert severity="error" variant="filled" sx={{my: 0, py: 0}}>Oups...Une erreur s'est produite</Alert>
        </Box>
    )
}

export default ErrorAlert;