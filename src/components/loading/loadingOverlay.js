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
            // TODO
            // https://stackoverflow.com/questions/69991556/mui-v5-disablebackdropclick-in-createtheme-equivalent
            disableBackdropClick
            open={open}
        >
            <CircularProgress color="inherit" />
        </Modal>
    );
}

export default LoadingOverlay;