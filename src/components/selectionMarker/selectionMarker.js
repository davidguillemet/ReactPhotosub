
import React from 'react';
import { Box } from '@mui/system';
import CheckIcon from '@mui/icons-material/Check';

const SelectionMarker = ({
    imageBorderWidth,
    withCheck,
    selectionMaskOpacity = 0,
    markerWidth = 5,
    selected = true}) => {
    return (
        <Box
            sx={{
                pointerEvents: 'none',
                position: "absolute",
                top: `${imageBorderWidth}px`,
                left: `${imageBorderWidth}px`,
                right: `${imageBorderWidth}px`,
                bottom: `${imageBorderWidth}px`,
                borderRadius: '0px',
                ...(selected && {
                    boxShadow: '4px 4px 6px -2px rgba(0,0,0,0.92);'
                }),
                ...(selected && markerWidth > 0 ?
                    {
                        borderColor: theme => theme.palette.secondary.light,
                        borderWidth: `${markerWidth}px`,
                        borderStyle: "solid",
                        backgroundColor: 'transparent',
                    }
                    : !selected ?
                    {
                        backgroundColor: `rgba(0,0,0,${selectionMaskOpacity})`,
                    }
                    : { /* empty */ }
                )
            }}
        >
            {
                withCheck &&
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        position: "absolute",
                        right: "3px",
                        bottom: "3px",
                        backgroundColor: theme => theme.palette.secondary.light,
                        borderRadius: '2px',
                    }}
                >
                    <CheckIcon
                        fontSize="medium"
                        sx={{
                            color: "white"
                        }}
                    />
                </Box>
            }
        </Box>
    )
}

export default SelectionMarker;