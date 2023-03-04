import React from 'react';
import Box from '@mui/material/Box'
import DefaultToolbar from './DefaultToolbar';
import ActionToolbar from './ActionToolbar';

const TableToolbar = () => {
    return (
        <React.Fragment>
            <Box
                sx={{
                    position: "relative",
                    height: "60px",
                    width: "100%",
                    bgcolor: theme => theme.palette.secondary.dark,
                }}
            >   
                <ActionToolbar />
                <DefaultToolbar />
            </Box>
        </React.Fragment>
    )
}

export default TableToolbar;