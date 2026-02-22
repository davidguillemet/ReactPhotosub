import React from 'react';
import LoadingButton from "@mui/lab/LoadingButton";
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'utils';

const NextPageButton = ({
    onClick,
    loading,
    count, // The number of images currently displayed
    totalCount, // The total number of images available
}) => {
    const t = useTranslation("components.search");
    return (
            <Stack direction={"column"} alignItems="center" sx={{ width: "100%", mt: 3 }}>
                <Box sx={{ flexGrow: 1 }} >
                    {t("resultsCountWithTotal", [count, totalCount])}
                </Box>
                <Box
                    sx={{
                        mt: 1,
                        flexGrow: 1,
                        height: 6,
                        backgroundColor: "grey.200",
                        borderWidth: 0,
                        borderRadius: 3,
                        width: "100%",
                        maxWidth: 300,
                        p: 0
                    }}
                >
                    <Box sx={{
                            height: "100%",
                            backgroundColor: theme => theme.palette.secondary.dark,
                            borderWidth: 0,
                            borderRadius: 3,
                            width: `${(count / totalCount) * 100}%`
                        }}
                    />
                </Box>
                <LoadingButton
                    loading={loading}
                    sx={{ mt: 3 }}
                    onClick={onClick}>
                        {t("nextResults")}
                </LoadingButton>
            </Stack>    
    );
};

export default NextPageButton;
