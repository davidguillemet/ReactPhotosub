import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Zoom from '@mui/material/Zoom';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import WarningIcon from '@mui/icons-material/Warning';
import Gallery from './gallery';
import { buildGroups } from './groupUtils';
import { Chip, Stack, Tooltip } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Paragraph } from 'template/pageTypography';
import TooltipIconButton from 'components/tooltipIconButton';
import { useAuthContext } from 'components/authentication';
import { uniqueID } from 'utils';

const renderGroupCoverOverlayFactory = (selectedOption, groups, admin) => {

    const AdminTools = selectedOption.adminTools;

    const renderGroupCoverOverlay = (image) => {

        const groupKey = image.groupKey;
        const group = groups.find(g => g.key === groupKey);

        return (
            <React.Fragment>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        position: 'absolute',
                        width: '100%',
                        height: 'auto',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        padding: 1,
                        bottom: '0px',
                        color: 'white',
                        pointerEvents: 'none',
                        justifyContent: "center"
                    }}
                >
                    <Paragraph
                        sx={{
                            color: theme => theme.palette.text.primary
                        }}
                    >
                        { /* The current image is a group cover and the title has been set to the group caption */}
                        {image.title}
                    </Paragraph>
                </Box>
                {
                    admin && AdminTools && 
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            height: 'auto',
                            padding: 0.5,
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 10
                        }}
                    >
                        {
                            groups && group.images.length === 0 &&
                            <Tooltip
                                title={"Aucune image ne correspond à cette catégorie"}
                                placement="bottom"
                                slots={{
                                    transition: Zoom
                                }}
                            >
                                <WarningIcon color="warning" sx={{ mr: 0.5}}/>
                            </Tooltip>
                        }
                        <AdminTools categoryKey={groupKey} />
                    </Box>
                }
            </React.Fragment>
        );
    };

    return renderGroupCoverOverlay;
};

export const HierarchicalGroupGallery = ({images, groupOptions, defaultGroupValue, onGroupingChanged}) => {

    const authContext = useAuthContext();
    const [selectedValue, setSelectedValue] = React.useState(defaultGroupValue);
    const selectedOption = React.useMemo(
        () => groupOptions.find(o => o.value === selectedValue) ?? groupOptions[0],
        [groupOptions, selectedValue]
    );

    const [currentGroupIndex, setCurrentGroupIndex] = React.useState(null);
    const [groups] = React.useMemo(() => buildGroups(images, selectedOption.groupBuilder, "desc"), [images, selectedOption.groupBuilder]);

    const safeCurrentGroupIndex =
        selectedOption.groupBuilder === null ? 0 : // If no groupBuilder, there is only one global group: selected by default
        (currentGroupIndex !== null && currentGroupIndex < groups.length) ? currentGroupIndex :
        null;

    const rootImages = React.useMemo(() => {
        if (selectedOption.groupBuilder !== null) {
            return groups.map(group => {
                let groupCoverImage;
                if (group.images.length === 0) {
                    // For example an empty portfolio category
                    groupCoverImage = {
                        src: '/unknown.svg',
                        id: uniqueID(), // Required for the gallery, to make sure Each child in the list has a unique "key" prop (key=iem.id)
                        sizeRatio: 1.5
                    };
                } else {
                    const landscapeCovers = group.images;
                    groupCoverImage = landscapeCovers[Math.floor(Math.random() * landscapeCovers.length)];
                }
                return {
                    ...groupCoverImage,
                    title: group.caption,
                    description: group.caption,
                    groupKey: group.key
                };
            });
        } else {
            // Only one global group
            return groups[0].images;
        }
    }, [groups, selectedOption.groupBuilder]);

    const imagesToDisplay = React.useMemo(
        () => safeCurrentGroupIndex !== null ? groups[safeCurrentGroupIndex].images : rootImages,
        [groups, safeCurrentGroupIndex, rootImages]
    );

    const onGroupClick = React.useCallback((index) => {
        const group = groups[index];
        if (group?.images && group.images.length === 0) {
            // The clicked group is empty, do nothing...
            return;
        }
        setCurrentGroupIndex(index);
    }, [groups]);

    const onGoToGroupList = React.useCallback(() => {
        setCurrentGroupIndex(null);
    }, []);

    const onGroupingSelectionChanged = React.useCallback((e) => {
        const newGrouping = e.target.value;
        setSelectedValue(newGrouping);
        setCurrentGroupIndex(null);
        onGroupingChanged(newGrouping);
    }, [onGroupingChanged]);

    const onImageClick = 
        safeCurrentGroupIndex !== null ? null : /* let the viewer being opened */
        onGroupClick;                           /* Show group images */

    const renderOverlay =
        safeCurrentGroupIndex === null ?
        renderGroupCoverOverlayFactory(selectedOption, groups, authContext.admin) : // Custom overlay for group covers
        null;   // Default overlay for group images

    return (
        <React.Fragment>
            <Stack direction='row' sx={{width: '100%', alignItems: "center"}}>
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                <Select
                    value={selectedValue}
                    onChange={onGroupingSelectionChanged}
                >
                    {groupOptions.map(o => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                </Select>
                </FormControl>
                {
                    selectedOption.groupBuilder !== null && safeCurrentGroupIndex !== null &&
                    <React.Fragment>
                        <ArrowForwardIosIcon fontSize="small" sx={{ color: theme => theme.palette.text.disabled}}/>
                        <Chip
                            label={groups[safeCurrentGroupIndex].caption}
                            color='success'
                            sx={{ ml: 0.5, mr: 1}}
                        />
                        <TooltipIconButton
                            tooltip={selectedOption.groupLabel}
                            onClick={onGoToGroupList}
                            size='small'
                        >
                            <KeyboardArrowUpIcon fontSize='small'/>
                        </TooltipIconButton>
                    </React.Fragment>
                }
            </Stack>
            <Gallery
                images={imagesToDisplay}
                onImageClick={onImageClick}
                sort={safeCurrentGroupIndex === null ? "none" : "desc"} // Don't sort images for the group covers to preserve the index
                withFavorite={safeCurrentGroupIndex !== null} // No favorite button for the group covers
                renderOverlay={renderOverlay}
            />
        </React.Fragment>
    );
};
