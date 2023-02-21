import React from 'react';
import Box from '@mui/material/Box'
import DefaultToolbar from './DefaultToolbar';
import ActionToolbar from './ActionToolbar';

const ToolbarWrapper = ({children}) => {
    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                flexGrow: 1,
                justifyContent: "space-between",
                padding: 1
            }}
        >
            {children}
        </Box>
    );
};

const TableToolbar = () => {
    return (
        <React.Fragment>
            <Box
                sx={{
                    position: "relative",
                    height: "60px",
                    width: "100%",
                    bgcolor: theme => theme.palette.secondary.light,
                }}
            >   
                    <ToolbarWrapper>
                        <ActionToolbar />
                    </ToolbarWrapper>

                    <ToolbarWrapper>
                        <DefaultToolbar />
                    </ToolbarWrapper>
            </Box>
        </React.Fragment>
    )
}

export default TableToolbar;