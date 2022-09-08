import { Typography } from '@mui/material';
import DestinationLink from '../destinationLink';
import { useGlobalContext } from '../globalContext';
import { formatDateShort } from '../../utils';
import { useReactQuery } from '../reactQuery';

const DestinationLinkContent = ({destination}) => {
    return (
        <Typography
            variant="body2"
            sx={{
                mt: 0.5,
                mb: 0,
                color: theme => theme.palette.link.main
            }}
        >
            {destination.title} - {formatDateShort(new Date(destination.date))}
        </Typography>
    );
};

const ImageDestinationLink = ({image}) => {

    const context = useGlobalContext();
    const [year, title] = image.path.split('/');
    const { data: destination } = useReactQuery(context.useFetchDestinationDesc, [year, title]);

    return (
        <DestinationLink destination={destination} >
            <DestinationLinkContent destination={destination} />
        </DestinationLink>
    );
}

export default ImageDestinationLink;