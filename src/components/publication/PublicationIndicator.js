import React from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from "@mui/material/styles";

export const PublicationIndicator = styled(({published, ...other}) => {
    if (published === true) {
        return null;
    }

    return (
        <WarningIcon color='warning' {...other} />
    );
})({});