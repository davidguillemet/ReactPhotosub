import { Typography } from '@mui/material';
import DestinationLink from '../destinationLink';
import { useQueryContext } from '../queryContext';
import { formatDateShort, useLanguage } from '../../utils';
import { useReactQuery } from '../reactQuery';

const DestinationLinkContent = ({destination}) => {
    const { language } = useLanguage();
    return (
        <Typography
            variant="body"
            sx={{
                mt: 0.5,
                mb: 0,
                color: theme => theme.palette.link.main
            }}
        >
            {destination.title} - {formatDateShort(new Date(destination.date), language)}
        </Typography>
    );
};

const ImageDestinationLink = ({image}) => {

    const queryContext = useQueryContext();
    const [year, title] = image.path.split('/');
    const { data: destination } = useReactQuery(queryContext.useFetchDestinationDesc, [year, title]);

    return (
        <DestinationLink destination={destination} >
            <DestinationLinkContent destination={destination} />
        </DestinationLink>
    );
}

export default ImageDestinationLink;