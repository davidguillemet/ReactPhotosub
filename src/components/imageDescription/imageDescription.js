import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { parseImageDescription, useLanguage } from '../../utils';
import { VerticalSpacing } from 'template/spacing';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { NoWrapAndEllipsis } from 'template/pageTypography';

const NavigationButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: "#FFFFFF"
}));

const getDescriptionFromLanguage = (captions, requiredLanguage) => {
    const otherLanguage = requiredLanguage === 'fr' ? 'en' : 'fr';
    return captions[requiredLanguage] || captions[otherLanguage]
}

const ImageDescription = ({ image, withNavigation = true}) => {

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
        <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            sx={{
                my: 0,
                mx: 0,
                justifyContent: 'center'
            }}
        >
            {
                withNavigation &&
                <NavigationButton
                    onClick={handlePreviousDescription}
                    size="small"
                    disabled={descriptionIndex <= 0}
                    sx={{
                        mr: 1
                    }}
                >
                    <NavigateBeforeIcon fontSize='small' />
                </NavigationButton>
            }

            <Stack
                direction='column'
                sx={{
                    textAlign: 'center'
                }}
            >
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
            </Stack>

            {
                withNavigation && 
                <NavigationButton
                    onClick={handleNextDescription}
                    size="small"
                    disabled={descriptionIndex >= description.length - 1}
                    sx={{
                        ml: 1
                    }}
                >
                    <NavigateNextIcon fontSize='small' />
                </NavigationButton>
            }

        </Stack>
    );
}

export default ImageDescription;