import React, { useRef } from 'react';
import {isMobile} from 'react-device-detect';
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from "@mui/material/Chip";
import Typography from '@mui/material/Typography';
import { formatDate, getThumbnailSrc, useLanguage, useTranslation, regionTitle, destinationTitle } from 'utils';
import DestinationLink from '../../components/destinationLink';
import MasonryGallery from '../../components/masonryGallery';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuthContext } from '../../components/authentication';
import EditDestinationDialog from './EditDestinationDialog';
import {unstable_batchedUpdates} from 'react-dom';
import { useQueryContext } from '../../components/queryContext';
import ConfirmDialog from '../../dialogs/ConfirmDialog';

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
    const selector = gsap.utils.selector(container);

    const onMouseEnter = () => {
        gsap.to(selector(".details"), { y: -30, ease: "bounce.out" });
        gsap.to(selector(".image"), { scale: 1.1, ease: "bounce.out" });
    };

    const onMouseLeave = () => {
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
                <Stack direction="row" sx={{position: "absolute", top: 0, right: 0}}>
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

    const t = useTranslation("pages.destinations");
    const queryContext = useQueryContext();
    const authContext = useAuthContext();
    const deleteDestinationMutation = queryContext.useDeleteDestination();

    const [editIsOpen, setEditIsOpen] = React.useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
    const [destinationToEdit, setDestinationToEdit] = React.useState(null);

    const onEditDestination = (destination) => {
        unstable_batchedUpdates(() => {
            setEditIsOpen(true);
            setDestinationToEdit(destination);
        });
    }

    const onNewDestination = () => {
        unstable_batchedUpdates(() => {
            setEditIsOpen(true);
            setDestinationToEdit(null);
        });
    }

    const onDeleteDestination = () => {
        return deleteDestinationMutation.mutateAsync(destinationToEdit);
    }

    const onClickDeleteDestination = (destination) => {
        unstable_batchedUpdates(() => {
            setConfirmDeleteOpen(true);
            setDestinationToEdit(destination);
        })
    }

    const onCloseDestinationEditor = () => {
        unstable_batchedUpdates(() => {
            setEditIsOpen(false);
            setDestinationToEdit(null);
        });
    };

    return (
        <React.Fragment>
            {
                authContext.admin === true &&
                <IconButton aria-label="new" size="large" onClick={onNewDestination}>
                    <AddCircleOutlineIcon fontSize="large" />
                </IconButton>
            }

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
            <EditDestinationDialog
                open={editIsOpen}
                destination={destinationToEdit}
                onClose={onCloseDestinationEditor}
            />
            {
                destinationToEdit &&
                <ConfirmDialog
                    open={confirmDeleteOpen}
                    onOpenChanged={setConfirmDeleteOpen}
                    onValidate={onDeleteDestination}
                    title={t("title:confirmRemove")}
                    dialogContent={[
                        t("confirmRemove", destinationTitle(destinationToEdit, t.language)),
                        t("warningConfirmRemove")
                    ]}
                />
            }
        </React.Fragment>
    )
}

export default DestinationGallery;