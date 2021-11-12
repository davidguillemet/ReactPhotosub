import { Box } from '@mui/system';
import CheckIcon from '@mui/icons-material/Check';

const SelectionMarker = ({imageBorderWidth, withCheck}) => {
    return (
        <Box
            sx={{
                position: "absolute",
                top: `${imageBorderWidth}px`,
                left: `${imageBorderWidth}px`,
                right: `${imageBorderWidth}px`,
                bottom: `${imageBorderWidth}px`,
                borderColor: theme => theme.palette.warning.light,
                borderWidth: "5px",
                borderStyle: "solid"
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
                        backgroundColor: theme => theme.palette.warning.light,
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