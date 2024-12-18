import React from 'react';
import LoadingButton from "@mui/lab/LoadingButton";

import { useTranslation } from 'utils';

const NextPageButton = ({
    onClick,
    loading,
    count       // The number of images currently displayed
}) => {
    const t = useTranslation("components.search");
    return (
        <LoadingButton
            loading={loading}
            sx={{ mt: 3, width: "100%"}}
            onClick={onClick}>
                {t("nextResults")}
        </LoadingButton>
    );
};

export default NextPageButton;