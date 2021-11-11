import Box from '@mui/material/Box';
import { PageHeader } from '../../template/pageTypography';

const Separator = () => {
    return (
        <Box
            sx={{
                flex: 1,
                mx: 2,
                height: "1px",
                borderTopWidth: "2px",
                borderTopStyle: "solid",
                borderTopColor: theme => theme.palette.divider
            }}
        />
    );
}

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
            <Separator />
            <PageHeader sx={{my: 0, color: theme => theme.palette.text.disabled, fontWeight: "400"}}>{label}</PageHeader>
            <Separator />
        </Box>
    )
};

export default LabeledDivider;