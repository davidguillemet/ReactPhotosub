import React from 'react';
import { Loading } from 'components/hoc';
import { Box } from '@mui/material';

const FullPageLoading = () => {
    return (
        <Box
            sx={{
                display: "flex",
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Loading />
        </Box>
    )
};

export default FullPageLoading;