import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import {isMobile} from 'react-device-detect';
import ImageDescription from '../imageDescription';
import ImageDestinationLink from './imageDestinationLink';
import { VerticalSpacing } from 'template/spacing';
import { Stack } from '@mui/material';

const ImageInfo = ({image, displayDestination, style}) => {

    return (
        <Box
            sx={{
                ...style,
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                py: 0.5,
                textAlign: 'center',
                bgcolor: 'rgb(0,0,0,0.4)'
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 2,
                    bgcolor: 'rgb(0,0,0,0.3)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translateY(-50%) translateX(-50%)',
                    ...(isMobile ? {
                        width: '95%'
                    } : {
                        minWidth: '70%'
                    })
                }}
            >
                <Stack direction={'column'} >
                    <ImageDescription image={image} />
                    {
                        displayDestination &&
                        <React.Fragment>
                            <VerticalSpacing />
                            <ImageDestinationLink image={image} />
                        </React.Fragment>
                    }
                    <VerticalSpacing />
                    <Box>
                    {
                        image.tags.map(tag => {
                            return (
                            <Chip color="primary" key={tag} label={tag} size="small" sx={{marginRight: 0.5, marginTop: 0.5, color: 'white'}} />
                            )
                        })
                    }
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}

export default ImageInfo;