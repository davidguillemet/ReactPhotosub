import { Box } from '@mui/system';
import { Paper } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const SelectionMarker = ({
    imageBorderWidth,
    withCheck,
    opacity = 0,
    markerWidth = 5,
    selected = true}) => {
    return (
        <Paper
            elevation={selected ? 5 : 0}
            sx={{
                pointerEvents: 'none',
                position: "absolute",
                top: `${imageBorderWidth}px`,
                left: `${imageBorderWidth}px`,
                right: `${imageBorderWidth}px`,
                bottom: `${imageBorderWidth}px`,
                borderRadius: '0px',
                ...(selected && markerWidth > 0 ?
                    {
                        borderColor: theme => theme.palette.secondary.light,
                        borderWidth: `${markerWidth}px`,
                        borderStyle: "solid",
                        backgroundColor: 'transparent',
                    }
                    : !selected ?
                    {
                        backgroundColor: `rgba(255,255,255,${opacity})`,
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
        </Paper>
    )
}

export default SelectionMarker;