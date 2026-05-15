import React, { useRef, useState, useLayoutEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';    
import Chip from "@mui/material/Chip";
import Typography from '@mui/material/Typography';
import { formatDate, useLanguage, regionTitle, destinationTitle } from 'utils';
import DestinationLink from 'components/destinationLink';
import MasonryGallery from 'components/masonryGallery';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../components/authentication';
import { PublicationIndicator } from 'components/publication';
import useAdminActions from './admin/UseAdminActions';
import LazyImage from '../../components/lazyImage';

const DestinationDetails = ({destination, onHeightCalculated}) => {
    const { language } = useLanguage();

    const visibleRef = useRef();

    useLayoutEffect(() => {
        if (visibleRef.current && onHeightCalculated) {
            onHeightCalculated(visibleRef.current.offsetHeight);
        }
    }, [onHeightCalculated]);

    return (
        <React.Fragment>
            <div ref={visibleRef}>
            <Typography variant="h5">{destinationTitle(destination, language)}</Typography>
            <Typography variant='h6' sx={{fontWeight: 300}}>{formatDate(new Date(destination.date), language)}</Typography>
            </div>
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}
            >
                {destination.regionpath.slice(0).reverse().map((region, index) => {
                    return (
                        <Chip
                            size="small"
                            key={region.id}
                            label={<Typography variant="caption">{regionTitle(region, language)}</Typography>}
                            variant="outlined"
                            color="primary"
                            sx={{
                                ml: index > 0 ? '5px' : 0,
                                mt: 0.5
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
    const destinationImage = React.useMemo(() => ({
        src: destination.cover,
        description: destinationTitle(destination, "en") // force English for the cover image description
    }), [destination]);

    const authContext = useAuthContext();
    const { onEdit, onDelete } = params;

    const container = useRef();
    const [visibleHeight, setVisibleHeight] = useState(65); // Default value, will be updated on mount

    const onMouseEnter = () => {
        const selector = gsap.utils.selector(container);
        gsap.to(selector(".details"), {
            y: (index, target, targets) => {
                const detailsHeight = target.offsetHeight;
                return -(detailsHeight - visibleHeight);
            },
            ease: "bounce.out"
        });
    };

    const onMouseLeave = () => {
        const selector = gsap.utils.selector(container);
        gsap.to(selector(".details"), { y: 0, ease: "bounce.out" });
    };

    const onEditDestination = () => {
        onEdit(destination);
    }

    const onDeleteDestination = () => {
        onDelete(destination);
    }

    const onImageLoaded = React.useCallback(() => {
        const selector = gsap.utils.selector(container);
        gsap.to(selector(".details"), { opacity: 1, ease: "bounce.out" });
    }, [container]);

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
                <LazyImage
                    index={index}  
                    image={destinationImage}
                    width={width}
                    renderOverlay={false}
                    onImageLoaded={onImageLoaded}
                    withFavorite={false}
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
                        ...(isMobile && { bottom: '0px' }),
                        ...(!isMobile && { top: `calc(100% - ${visibleHeight}px)` }),
                        color: 'white',
                        opacity: 0,
                        pointerEvents: 'none'
                    }}
                    className="details"
                >
                    <DestinationDetails destination={destination} onHeightCalculated={setVisibleHeight} />
                </Box>
            </DestinationLink>
            {
                authContext.admin === true &&
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        position: "absolute",
                        top: 8,
                        right: 0
                    }}
                >
                    <PublicationIndicator published={destination.published} sx={{mr: 1}} />
                    <IconButton aria-label="edit" onClick={onEditDestination} sx={{mr: 1}}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="remove" onClick={onDeleteDestination} sx={{mr: 1}}>
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            }
        </Box>
    );
}

const DestinationGallery = ({destinations}) => {

    const { AdminActions, onEditDestination, onClickDeleteDestination } = useAdminActions();

    return (
        <React.Fragment>

            <MasonryGallery
                items={destinations}
                colWidth={350}
                heightProvider={(item, itemWidth) => itemWidth / (600/400)} // We could get the cover ratio with a join in the SQL query
                renderComponent={DestinationContent}
                renderExtraParams={{
                    onEdit: onEditDestination,
                    onDelete: onClickDeleteDestination
                }}
            />

            <AdminActions />

        </React.Fragment>
    )
}

export default DestinationGallery;