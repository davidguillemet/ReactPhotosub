import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { PublicationIndicator } from 'components/publication';
import DestinationLink from '../destinationLink';
import { useQueryContext } from '../queryContext';
import { formatDateShort, useLanguage, destinationTitle } from '../../utils';
import { useReactQuery } from '../reactQuery';
import { useAuthContext } from 'components/authentication';

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
            {destinationTitle(destination, language)} - {formatDateShort(new Date(destination.date), language)}
        </Typography>
    );
};

const ImageDestinationLink = ({image}) => {

    const authContext = useAuthContext();
    const queryContext = useQueryContext();
    const { data: destination } = useReactQuery(queryContext.useFetchDestinationDesc, [image.path]);

    return (
        <Stack direction={"row"}>
            <DestinationLink destination={destination} >
                <DestinationLinkContent destination={destination} />
            </DestinationLink>
            {
                authContext.admin === true &&
                <PublicationIndicator published={destination?.published} sx={{ml: 1 }}/>
            }
        </Stack>
    );
}

export default ImageDestinationLink;