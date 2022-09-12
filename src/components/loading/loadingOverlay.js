import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingOverlay = ({ open }) => {
    return (
        <Modal
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            disableBackdropClick
            open={open}
        >
            <CircularProgress color="inherit" />
        </Modal>
    );
}

export default LoadingOverlay;