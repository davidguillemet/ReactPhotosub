import React, { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import { parseImageDescription, useLanguage } from '../../utils';
import { VerticalSpacing } from 'template/spacing';
import { Box } from '@mui/material';

const getDescriptionFromLanguage = (captions, requiredLanguage) => {
    const otherLanguage = requiredLanguage === 'fr' ? 'en' : 'fr';
    return captions[requiredLanguage] || captions[otherLanguage]
}

const ImageDescription = ({ image }) => {

    const t = useLanguage();
    const [ descriptionIndex ] = useState(0);
    const vernacularIndex = 0; // Always the first vernacular name
    /**
     * captions = {
     *  french: [
     *      {
     *          vernacular: [ <string>, <string>, ...],
     *          scientific: <string>
     *      },
     *      {
     *          vernacular: [ <string>, <string>, ...],
     *          scientific: <string>
     *      },
     *      ...
     *  ],
     *  english: [
     *      ...
     *  ] 
     * }
     */
    const captions = useMemo(() => parseImageDescription(image), [image]);
    const description = useMemo(() => getDescriptionFromLanguage(captions, t.language), [captions, t.language])

    if (!description) {
        return (
            <Typography variant="subtitle1" style={{ marginBottom: 0, color: 'white' }}>
                Aucune description
            </Typography>
        )
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            my: 0,
            mx: 0
        }}>
            <Typography variant="subtitle1" sx={{ m: 0, lineHeight: 1.25, color: 'white'}}>
                { description[descriptionIndex].vernacular[vernacularIndex] }
            </Typography>
            <VerticalSpacing factor={1} />
            <Typography variant="subtitle2" sx={{ m: 0, lineHeight: 1.25, fontStyle: 'italic', color: 'white'}}>
                { `(${description[descriptionIndex].scientific})` }
            </Typography>
        </Box>
    );
}

export default ImageDescription;