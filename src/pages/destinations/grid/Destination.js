import { useState, useCallback } from 'react';
import { formatDate } from '../../../utils';
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import React from "react";
import DestinationLink from '../../../components/destinationLink';
import { useIntersectionObserver } from '../../../components/hooks';

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

const Destination = ({destination, regions, itemWidth, margin, colIndex}) => {

    const [isVisible, setIsVisible] = useState(false);

    const onVisible = useCallback(() => {
        setIsVisible(true);
    }, []);

    const containerRef = useIntersectionObserver(onVisible);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: 'auto !important',
                ml: colIndex === 0 ? 0 : `${margin}px`,
                mr: 0,
                mb: `${margin}px`,
                width: `${itemWidth}px`,
                borderRadius: '5px',

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
                },

                // Transition opacity on visible
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 2000ms',
            }}
        >
            {
                isVisible &&
                <DestinationLink destination={destination}>
                    <img src={destination.cover} alt={destination.title} style={{
                        height: '100%',
                        width: '100%'
                    }}/>
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
                        <DestinationDetails destination={destination} regions={regions} />
                    </Box>
                </DestinationLink>
            }
        </Box>
    );
}

export default Destination;