import React from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Gallery from './gallery';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { buildGroups } from './groupUtils';
import { Stack } from '@mui/material';
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
                        <AdminTools group={group} />
                    </Box>
                }
            </React.Fragment>
        );
    };

    return renderGroupCoverOverlay;
};

const SELECT_CONTENT = {
    GROUPING_OPTIONS: "groupingOptions",
    GROUP_LIST: "groupList"
};

const GALLERY_CONTENT = {
    GROUP_COVERS: "groupCovers",
    GROUP_IMAGES: "groupImages"
};

export const HierarchicalGroupGallery = ({
    images,
    groupingOptions,
    defaultGroupingValue,
    onGroupingChanged,
    diaporamaEnabled = false
}) => {

    // Initialize the display with the grouping options
    const authContext = useAuthContext();
    const [selectedValue, setSelectedValue] = React.useState(defaultGroupingValue);
    const [currentGroupIndex, setCurrentGroupIndex] = React.useState(null);
    const [localGroupingOptions, setLocalGroupingOptions] = React.useState(groupingOptions);
    const [slideshowTrigger, setSlideshowTrigger] = React.useState(0);

    const prevGroupingOptions = React.useRef(localGroupingOptions);
    React.useEffect(() => {
        if (prevGroupingOptions.current !== groupingOptions) {
            // The grouping options have changed, we need to update the selected option and the selected value
            setLocalGroupingOptions(groupingOptions);
            const newSelectedOption = groupingOptions.find(o => o.value === defaultGroupingValue) ?? groupingOptions[0];
            setSelectedGroupingOption(newSelectedOption);
            setSelectedValue(newSelectedOption.value);
            setCurrentGroupIndex(null);
        }
    }, [groupingOptions, defaultGroupingValue]);

    const [selectedGroupingOption, setSelectedGroupingOption] = React.useState(() => localGroupingOptions.find(o => o.value === defaultGroupingValue) ?? localGroupingOptions[0]);

    const [groups] = React.useMemo(() => buildGroups(images, selectedGroupingOption?.groupBuilder, "desc"), [images, selectedGroupingOption.groupBuilder]);

    const safeCurrentGroupIndex =
        // selectedGroupingOption.groupBuilder === null ? 0 : // If no groupBuilder, there is only one global group: selected by default
        (currentGroupIndex !== null && currentGroupIndex < groups.length) ? currentGroupIndex :
        null;
    
    const selectContentType = React.useMemo(() => {
        if (safeCurrentGroupIndex === null) {
            return SELECT_CONTENT.GROUPING_OPTIONS;
        } else {
            return SELECT_CONTENT.GROUP_LIST;
        }
    }, [safeCurrentGroupIndex]);

    const galleryContentType = React.useMemo(() => {
        if (safeCurrentGroupIndex === null && selectedValue !== 'none') {
            return GALLERY_CONTENT.GROUP_COVERS;
        } else {
            return GALLERY_CONTENT.GROUP_IMAGES;
        }
    }, [safeCurrentGroupIndex, selectedValue]);

    // Root images are the cover images for each group, depending on the selected grouping option
    const rootImages = React.useMemo(() => {
        if (selectedGroupingOption?.groupBuilder !== null) {
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
    }, [groups, selectedGroupingOption.groupBuilder]);

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
        setSelectedValue(group.key);
    }, [groups]);

    const onGoToGroupList = React.useCallback(() => {
        setCurrentGroupIndex(null);
        setSelectedValue(selectedGroupingOption.value);
    }, [selectedGroupingOption.value]);

    React.useEffect(() => {
        if (selectContentType === SELECT_CONTENT.GROUPING_OPTIONS) {
            // We are currently on the grouping options, we can directly switch to the new grouping
            setCurrentGroupIndex(null);
            onGroupingChanged(selectedValue);
            setSelectedGroupingOption(localGroupingOptions.find(o => o.value === selectedValue) ?? localGroupingOptions[0]);
            return;
        } else { // SELECT_CONTENT.GROUP_LIST
            // We are currently on the group list, we can directly switch to the new group
            // -> get the group index from the key (= newSelectValue)
            const groupIndex = groups.findIndex(g => g.key === selectedValue);
            setCurrentGroupIndex(groupIndex);
            return;
        }
    }, [localGroupingOptions, selectedValue, groups, onGroupingChanged, selectContentType]);

    const onGroupingSelectionChanged = React.useCallback((e) => {
        const newSelectValue = e.target.value;
        setSelectedValue(newSelectValue);
    }, []);

    const launchDiaporama = React.useCallback(() => {
        setSlideshowTrigger(prev => prev + 1);
    }, []);

    const onImageClick = 
        galleryContentType === GALLERY_CONTENT.GROUP_COVERS ?
        onGroupClick :  /* Show group images */
        null;           /* let the viewer being opened */

    const renderOverlay =
        galleryContentType === GALLERY_CONTENT.GROUP_COVERS ?
        renderGroupCoverOverlayFactory(selectedGroupingOption, groups, authContext.admin) : // Custom overlay for group covers
        null;   // Default overlay for group images
    
    const selectOptions = React.useMemo(() => {
        return selectContentType === SELECT_CONTENT.GROUPING_OPTIONS?
               localGroupingOptions.map(o => ({ value: o.value, label: o.label })) :
               groups.map(group => ({ value: group.key, label: group.caption }));
    }, [localGroupingOptions, selectContentType, groups]);

    return (
        <Stack direction='column' sx={{width: '100%', alignItems: "center"}}>
            {
                diaporamaEnabled &&
                <Button
                    endIcon={<PlayArrowIcon />}
                    disabled={galleryContentType === GALLERY_CONTENT.GROUP_COVERS || imagesToDisplay.length === 0}
                    onClick={launchDiaporama}
                >
                    Lancer le diaporama
                </Button>
            }
            <Stack direction='row' sx={{width: '100%', alignItems: "center"}}>
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                <Select
                    value={selectedValue}
                    onChange={onGroupingSelectionChanged}
                >
                    {selectOptions.map(o => (
                        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                </Select>
                </FormControl>
                {
                    selectedGroupingOption.groupBuilder !== null && safeCurrentGroupIndex !== null &&
                    <React.Fragment>
                        <TooltipIconButton
                            tooltip={selectedGroupingOption.groupLabel}
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
                imageAdminTools={
                    safeCurrentGroupIndex === null ?
                    null :  // No image admin tool for the group covers
                    selectedGroupingOption.imageAdminTools // Image admin tool for the group images, depending on the selected grouping option
                }
                launchSlideshow={slideshowTrigger}
            />
        </Stack>
    );
};
