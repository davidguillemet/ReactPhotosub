import { Typography } from '@mui/material';
import DestinationLink from '../destinationLink';
import { useGlobalContext } from '../globalContext';
import { formatDateShort } from '../../utils';
import { withLoading, buildLoadingState } from '../hoc';


const DestinationLinkContent = withLoading(({destination}) => {
    return (
        <Typography variant="body2" sx={{ mb: 0.5}}>{destination.title} - {formatDateShort(new Date(destination.date))}</Typography>
    );
}, [buildLoadingState("destination", [null, undefined])], { size: 16, marginTop: 0 });

const ImageDestinationLink = ({image}) => {

    const context = useGlobalContext();
    const [year, title] = image.path.split('/');
    const { data: destination } = context.useFetchDestinationDesc(year, title);

    return (
        <DestinationLink destination={destination} >
            <DestinationLinkContent destination={destination} />
        </DestinationLink>
    );
}

export default ImageDestinationLink;