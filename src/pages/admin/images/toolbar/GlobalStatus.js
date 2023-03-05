import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
const { useImageContext } = require("../ImageContext")

const GlobalStatus = () => {
    const imageContext = useImageContext();

    const errorCount = imageContext.errors.size;

    if (errorCount === 0) {
        return <Chip color="success" icon={<CheckCircleOutlineIcon />} label={"ok"}/>
    }
    return <Chip color="error" icon={<ErrorOutlineIcon />} label={errorCount} />
}

export default GlobalStatus;