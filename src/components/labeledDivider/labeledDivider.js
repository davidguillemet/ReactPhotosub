import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { PageHeader } from '../../template/pageTypography';

const LabeledDivider = ({label}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                alignItems: "center"
            }}
        >
            <Box sx={{ flex: 1, mx: 2, height: "1px", borderTop: "1px solid grey"}} />
            <PageHeader sx={{my: 0}}>{label}</PageHeader>
            <Box sx={{ flex: 1, mx: 2, height: "1px", borderTop: "1px solid grey"}} />
        </Box>
    )
};

export default LabeledDivider;