import React from 'react';
import { Box } from '@mui/system';
import { useImageContext } from '../ImageContext';
import DefaultToolbar from './DefaultToolbar';
import ActionToolbar from './ActionToolbar';

const TableToolbar = () => {
    const imageContext = useImageContext();
    return (
        <React.Fragment>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexGrow: 1,
                    justifyContent: "space-between",
                    bgcolor: theme => theme.palette.secondary.light,
                    padding: 1,
                    height: "60px",
                }}
            >   
            {
                imageContext.selectionCount > 0 ?
                <ActionToolbar /> :
                <DefaultToolbar />
            }
            </Box>
        </React.Fragment>
    )
}

export default TableToolbar;