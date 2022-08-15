import React, { useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import TranslateIcon from '@mui/icons-material/Translate';
import Typography from '@mui/material/Typography';
import ImageDescription from '../imageDescription'; 

const LANGUAGE_FRENCH = "french"
const LANGUAGE_ENGLISH = "english"

const ImageCaption = ({image}) => {
    const [language, setLanguage] = useState(LANGUAGE_FRENCH);
    const hasTitle = image.title.length > 0;
    const hasDescription = image.description.length > 0;
    const hasDetails = hasTitle || hasDescription;
    const hasTranslation = image.description !== image.title && image.description.length > 0;

    return (
            hasDetails ?
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    my: 0,
                    mx: 0
                }}>
                    <ImageDescription image={image} language={language} />
                </Box>
                {
                    hasTranslation && 
                    <ToggleButton
                        sx={{
                            position: "absolute",
                            top: "3px",
                            right: "3px",
                            padding: "3px"
                        }}
                        size="small"
                        value="check"
                        selected={language === LANGUAGE_ENGLISH}
                        disabled={!hasDescription}
                        onChange={() => {
                            setLanguage(prevLanguage => prevLanguage === LANGUAGE_ENGLISH ? LANGUAGE_FRENCH : LANGUAGE_ENGLISH);
                        }}
                        >
                        <TranslateIcon fontSize="small" />
                    </ToggleButton>
                }
            </Box> :
            <Typography variant="subtitle1" style={{ marginBottom: 0 }}>Aucune description</Typography>
    );
}

export default ImageCaption;