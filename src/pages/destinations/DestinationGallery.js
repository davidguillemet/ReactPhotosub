import React, { useRef } from 'react';
import { gsap } from "gsap";
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

const DestinationContent = ({item, index, width, params}) => {

    const destination = item;
    const regionsByDestination = params;

    const container = useRef();
    const selector = gsap.utils.selector(container);
    
    const onMouseEnter = ({ currentTarget }) => {
        gsap.to(selector(".details"), { y: -60, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1.1, ease: "bounce.out" });
    };

    const onMouseLeave = () => {
        gsap.to(selector(".details"), { y: 0, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1, ease: "bounce.out" });
    }
    
    return (
        <Box
            ref={container}
            sx={{
                position: 'relative',
                borderRadius: '5px',
                overflow: 'hidden',
                height: '100%',
                width: '100%',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
        <DestinationLink destination={destination}>
            <img
                className="image"
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
                className="details"
            >
                <Typography variant="h5">{formatDate(new Date(destination.date))}</Typography>
                <DestinationDetails destination={destination} regions={regionsByDestination.get(destination.id)} />
            </Box>
        </DestinationLink>
        </Box>
    );
}

const DestinationGallery = ({destinations, regionsByDestination}) => {

    return (
        <MasonryGallery
            items={destinations}
            colWidth={350}
            heightProvider={(item, itemWidth) => itemWidth / (600/400)} // We could get the cover ratio with a join in the SQL query
            margin={7}
            renderComponent={DestinationContent}
            renderExtraParams={regionsByDestination}
        />
    )
}

export default withLoading(DestinationGallery, [
    buildLoadingState("destinations", [null, undefined]),
    buildLoadingState("regionsByDestination", null)
]);