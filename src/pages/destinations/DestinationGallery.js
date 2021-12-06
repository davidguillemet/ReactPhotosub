import React, { useRef } from 'react';
import {isMobile} from 'react-device-detect';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import Chip from "@mui/material/Chip";
import Typography from '@mui/material/Typography';
import { formatDateShort, getThumbnailSrc } from '../../utils';
import DestinationLink from '../../components/destinationLink';
import MasonryGallery from '../../components/masonryGallery';

const DestinationDetails = ({destination}) => {
    return (
        <React.Fragment>
            <Typography variant="h5">{`${destination.title} - ${formatDateShort(new Date(destination.date))}`}</Typography>
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }}
            >
                {destination.regionpath.slice(0).reverse().map((region, index) => {
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

    const container = useRef();
    const selector = gsap.utils.selector(container);

    const onMouseEnter = () => {
        gsap.to(selector(".details"), { y: -30, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1.1, ease: "bounce.out" });
    };

    const onMouseLeave = () => {
        gsap.to(selector(".details"), { y: 0, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1, ease: "bounce.out" });
    };

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
            onMouseEnter={isMobile ? null : onMouseEnter}
            onMouseLeave={isMobile ? null : onMouseLeave}
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
                    bottom: isMobile ? '0px' : '-30px',
                    color: 'white'
                }}
                className="details"
            >
                <DestinationDetails destination={destination} />
            </Box>
        </DestinationLink>
        </Box>
    );
}

const DestinationGallery = ({destinations}) => {

    return (
        <MasonryGallery
            items={destinations}
            colWidth={350}
            heightProvider={(item, itemWidth) => itemWidth / (600/400)} // We could get the cover ratio with a join in the SQL query
            renderComponent={DestinationContent}
        />
    )
}

export default DestinationGallery;