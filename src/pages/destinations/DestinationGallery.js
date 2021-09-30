import React, { useCallback } from 'react';
import Box from '@material-ui/core/Box';
import Chip from "@material-ui/core/Chip";
import Typography from '@material-ui/core/Typography';
import { formatDate, getThumbnailSrc } from '../../utils';
import DestinationLink from '../../components/destinationLink';
import MasonryGallery from '../../components/masonryGallery';
import { withLoading, buildLoadingState } from '../../components/loading';

const DestinationDetails = ({destination, regions}) => {
    return (
        <React.Fragment>
            <Typography variant="h6">{destination.title}</Typography>
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}
            >
                {regions.map((region, index) => {
                    return (
                        <Chip
                            size="small"
                            key={region.id}
                            label={<Typography variant="caption">{region.title}</Typography>}
                            variant="outlined"
                            color="primary"
                            sx={{
                                ml: index > 0 ? '5px' : 0,
                                '&.MuiChip-outlinedPrimary': {
                                    color: '#fff',
                                    border: '1px solid #fff'
                                }
                            }}
                        />
                    );
                })}
            </Box>
        </React.Fragment>
    );
} 

const DestinationGallery = ({destinations, regionsByDestination}) => {

    const DestinationContent = useCallback((item, index, width) => {
        const destination = item;
        return (
            <Box sx={{
                position: 'relative',
                borderRadius: '5px',
                overflow: 'hidden',
                height: '100%',
                width: '100%',

                // Scale image on hover
                '& img': {
                    transition: (theme) => theme.transitions.create(
                        'transform',
                        {
                            duration: 700,
                            easing: theme.transitions.easing.easeOut,
                            delay: 0
                        }
                    )
                },
                '&:hover img': {
                    transform: 'scale(1.05)'
                },

                // Translate the details box up on hover
                '& > a > div' : {
                    transition: (theme) => theme.transitions.create(
                        'bottom',
                        {
                            duration: theme.transitions.duration.standard,
                            easing: theme.transitions.easing.easeOut
                        }
                    )
                },
                '&:hover > a > div': {
                    bottom: 0
                }
            }}>
            <DestinationLink destination={destination}>
                <img
                    src={getThumbnailSrc(destination.cover, width)}
                    alt={destination.title}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                />
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        position: 'absolute',
                        height: 'auto',
                        paddingBottom: '5px',
                        bottom: '-60px',
                        color: 'white'
                    }}
                >
                    <Typography variant="h5">{formatDate(new Date(destination.date))}</Typography>
                    <DestinationDetails destination={destination} regions={regionsByDestination.get(destination.id)} />
                </Box>
            </DestinationLink>
            </Box>
        );
    }, [regionsByDestination]);

    return (
        <MasonryGallery
            items={destinations}
            colWidth={350}
            heightProvider={(item, itemWidth) => itemWidth / (600/400)} // We could get the cover ratio with a join in the SQL query
            margin={7}
            renderItem={DestinationContent}
        />
    )
}

export default withLoading(DestinationGallery, [
    buildLoadingState("destinations", [null, undefined]),
    buildLoadingState("regionsByDestination", null)
]);
