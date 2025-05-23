import React, { useRef } from 'react';
import {isMobile} from 'react-device-detect';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';    
import Chip from "@mui/material/Chip";
import Typography from '@mui/material/Typography';
import { formatDate, getThumbnailSrc, useLanguage, regionTitle, destinationTitle } from 'utils';
import DestinationLink from '../../components/destinationLink';
import MasonryGallery from '../../components/masonryGallery';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../components/authentication';
import { PublicationIndicator } from 'components/publication';
import useAdminActions from './UseAdminActions';

const DestinationDetails = ({destination}) => {
    const { language } = useLanguage();

    return (
        <React.Fragment>
            <Typography variant="h5">{destinationTitle(destination, language)}</Typography>
            <Typography variant='h6' sx={{fontWeight: 300}}>{formatDate(new Date(destination.date), language)}</Typography>
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
                            label={<Typography variant="caption">{regionTitle(region, language)}</Typography>}
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

    const { language } = useLanguage();
    const destination = item;
    const authContext = useAuthContext();
    const { onEdit, onDelete } = params;

    const container = useRef();

    const onMouseEnter = () => {
        const selector = gsap.utils.selector(container);
        gsap.to(selector(".details"), { y: -30, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1.1, ease: "bounce.out" });
    };

    const onMouseLeave = () => {
        const selector = gsap.utils.selector(container);
        gsap.to(selector(".details"), { y: 0, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1, ease: "bounce.out" });
    };

    const onEditDestination = () => {
        onEdit(destination);
    }

    const onDeleteDestination = () => {
        onDelete(destination);
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
            onMouseEnter={isMobile ? null : onMouseEnter}
            onMouseLeave={isMobile ? null : onMouseLeave}
        >
            <DestinationLink destination={destination}>
                <img
                    className="image"
                    src={getThumbnailSrc(destination.cover, width)}
                    alt={destinationTitle(destination, language)}
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
            {
                authContext.admin === true &&
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{position: "absolute", top: 0, right: 0}}
                >
                    <PublicationIndicator published={destination.published} />
                    <IconButton aria-label="edit" onClick={onEditDestination}>
                        <EditIcon sx={{color: "white"}}/>
                    </IconButton>
                    <IconButton aria-label="remove" onClick={onDeleteDestination}>
                        <DeleteIcon sx={{color: "white"}}/>
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