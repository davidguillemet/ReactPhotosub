import React, { useMemo } from 'react';
import Typography from '@material-ui/core/Typography';
import { parseImageDescription } from '../../utils';

const ImageDescription = ({image, language = "french" }) => {

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

    if (captions[language] === null) {
        return null;
    }

    return (
        <React.Fragment>
            <Typography variant="subtitle1" sx={{ m: 0, lineHeight: 1.25}}>
            {
                captions[language][0].vernacular[0]
            }
            </Typography>
            <Typography variant="subtitle2" sx={{ m: 0, lineHeight: 1.25, fontStyle: 'italic'}}>
                {
                    captions[language][0].scientific
                }
            </Typography>
        </React.Fragment>
    );
}

export default ImageDescription;