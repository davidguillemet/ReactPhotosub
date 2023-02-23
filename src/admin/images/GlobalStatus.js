import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const { useImageContext } = require("./ImageContext")

const GlobalStatus = () => {
    const imageContext = useImageContext();
    if (imageContext.errors.size === 0) {
        return <Chip color="success" icon={<CheckCircleOutlineIcon />} label={"ok"}/>
    }
    return <Chip color="error" icon={<ErrorOutlineIcon />} label={imageContext.errors.size} />
}

export default GlobalStatus;