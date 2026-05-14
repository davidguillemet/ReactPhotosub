import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import {
    useLanguage,
    regionTitle,
} from 'utils';

const RegionChip = ({region}) => {
    const { language } = useLanguage();

    return (
        <Chip label={regionTitle(region, language)} sx={{m: 0, mr: 0.5, mt: 1}} size="small" />
    )
}

const RegionPath = ({regions, justifyContent = 'flex-start'}) => {

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: justifyContent,
                mb: 1,
                width: "100%"
            }}
        >
        { regions.slice(0).reverse().map(region => <RegionChip key={region.id} region={region} />) }
        </Box>
    );
}

export default RegionPath;