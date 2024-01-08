import React from 'react';
import { useImageContext } from './ImageContext';
import { Chip, IconButton, Stack } from '@mui/material';
import { Body } from 'template/pageTypography';
import { useTranslation } from 'utils';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const FilterStatus = ({status}) => {
    const imageContext = useImageContext();

    const toggleStatus = React.useCallback(() => {
        const toggleStatus = imageContext.toggleStatusFilter;
        toggleStatus(status);
    }, [status, imageContext.toggleStatusFilter]);

    return (
        <Chip
            label={status}
            size='small'
            color={status}
            variant={imageContext.displayStatus(status) ? "" : "outlined"}
            onClick={toggleStatus}/>
    );
};
 
const ItemFilter = () => {
    const imageContext = useImageContext();
    const t = useTranslation("pages.admin.images");

    const reset = React.useCallback(() => {
        const reset = imageContext.setDefaultItemStatusFilter;
        reset();
    }, [imageContext.setDefaultItemStatusFilter]);

    return (
        <Stack direction='row' spacing={1} sx={{mb: 1, alignItems: 'center'}}>
            <Body sx={{mt: 0}}>{t("filter")}</Body>
            {
                Object.keys(imageContext.getStatusFilter()).map(status => {
                    return <FilterStatus key={status} status={status} />
                })
            }
            <IconButton onClick={reset}>
                <HighlightOffIcon />
            </IconButton>
        </Stack>
    );
}

export default ItemFilter;
