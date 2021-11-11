import Paper from '@mui/material/Paper';
import ImageCaption from './imageCaption';
import ImageDestinationLink from './imageDestinationLink';

const ImageInfo = ({image, displayDestination}) => {

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'relative',
                mx: 1,
                my: 1,
                pl: 0.5,
                textAlign: 'center',
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: theme => theme.palette.grey[400]
            }}
        >
            <ImageCaption image={image} />
            {
                displayDestination &&
                <ImageDestinationLink image={image} />
            }
        </Paper>
    );
}

export default ImageInfo;