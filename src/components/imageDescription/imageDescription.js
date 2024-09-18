import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { parseImageDescription, useLanguage } from '../../utils';
import { VerticalSpacing } from 'template/spacing';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { isMobile } from 'react-device-detect';
import { NoWrapAndEllipsis } from 'template/pageTypography';

const useStyles = makeStyles({
    navigationButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        color: "#FFFFFF"
    }
});

const getDescriptionFromLanguage = (captions, requiredLanguage) => {
    const otherLanguage = requiredLanguage === 'fr' ? 'en' : 'fr';
    return captions[requiredLanguage] || captions[otherLanguage]
}

const ImageDescription = ({ image, withNavigation = true}) => {

    const classes = useStyles();
    const { language } = useLanguage();
    const [ descriptionIndex, setDescriptionIndex ] = useState(0);
    const [ description, setDescription ] = useState(() => getDescriptionFromLanguage(parseImageDescription(image), language))
    const vernacularIndex = 0; // Always the first vernacular name

    React.useEffect(() => {
        setDescription(getDescriptionFromLanguage(parseImageDescription(image), language));
        setDescriptionIndex(0);
    }, [image, language]);

    const handlePreviousDescription = React.useCallback(() => {
        setDescriptionIndex(index => index - 1);
    }, []);
    const handleNextDescription = React.useCallback(() => {
        setDescriptionIndex(index => index + 1);
    }, []);
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

    if (!description) {
        return null;
    }

    return (
        <Box sx={{
            position: 'relative',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            flex: 1,
            my: 0,
            mx: 0
        }}>
            <Typography
                variant="subtitle1"
                sx={{
                    m: 0,
                    pl: "5px",
                    pr: "5px",
                    lineHeight: 1.25,
                    color: 'white',
                    ...NoWrapAndEllipsis
                }}
            >
                { description[descriptionIndex].vernacular[vernacularIndex] }
            </Typography>
            {
                // The title/description might contain only a caption without any scientific name (Xxx xxx)
                description[descriptionIndex].scientific &&
                <React.Fragment>
                    <VerticalSpacing factor={1} />
                    <Typography variant="subtitle2" sx={{ m: 0, lineHeight: 1.25, fontStyle: 'italic', color: 'white'}}>
                        { `(${description[descriptionIndex].scientific})` }
                    </Typography>
                </React.Fragment>
            }
            {
                withNavigation && descriptionIndex > 0 &&
                <IconButton
                    className={classes.navigationButton}
                    onClick={handlePreviousDescription}
                    style={{
                        left: isMobile ? 5 : 10
                    }}
                    size="small"
                >
                    <NavigateBeforeIcon fontSize='small' />
                </IconButton>
            }
            {
                withNavigation && descriptionIndex < description.length - 1 &&
                <IconButton
                    className={classes.navigationButton}
                    onClick={handleNextDescription}
                    style={{
                        right: isMobile ? 5 : 10
                    }}
                    size="small"
                >
                    <NavigateNextIcon fontSize='small' />
                </IconButton>
            }
        </Box>
    );
}

export default ImageDescription;