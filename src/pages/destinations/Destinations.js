import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab'; 
import Fade from '@mui/material/Fade';

import AppsIcon from '@mui/icons-material/Apps';
import PublicIcon from '@mui/icons-material/Public';
import { styled } from '@mui/material/styles';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { PageTitle, Paragraph } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { DestinationsMap } from '../../components/map';
import RegionFilter from './RegionFilter';
import KeyWordFilter from './KeyWordFilter';
import DateFilter from './DateFilter';
import { useQueryContext } from '../../components/queryContext';
import DestinationGallery from './DestinationGallery';
import { buildLoadingState, withLoading } from '../../components/hoc';

import { useReactQuery } from '../../components/reactQuery';
import { useTranslation } from '../../utils';
import { Alert, IconButton, Stack } from '@mui/material';

const DestinationTabPanel = styled(TabPanel)(({ theme }) => ({
    '&.MuiTabPanel-root': {
        padding: 0,
        width: '100%'
    },
}));

const VIEW_GRID = 'grid';
const VIEW_MAP = 'map';

const TYPE_MACRO = 'macro';
const TYPE_WIDE_ANGLE = 'wide';
const TYPE_ALL = 'all';

const FILTER_REGION = 0;
const FILTER_KEYWORD = 1;
const FILTER_DATE = 2;

const DisplayModeSelector = ({listType, onChange}) => {

    const [ type, setType ] = useState(listType);

    useEffect(() => {
        setType(listType);
    }, [listType]);

    return (
        <ToggleButtonGroup exclusive value={type} onChange={onChange} >
            <ToggleButton value={VIEW_GRID} >
                <AppsIcon />
            </ToggleButton>
            <ToggleButton value={VIEW_MAP} >
                <PublicIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}

const PictureTypeSelector = ({destinationType, onChange}) => {

    const t = useTranslation("pages.destinations");
    return (
        <ToggleButtonGroup
            size={"small"}
            value={destinationType}
            onChange={onChange}
            exclusive
        >
            <ToggleButton value={TYPE_ALL}>{t("allDestinations")}</ToggleButton>
            <ToggleButton value={TYPE_MACRO}>{t("macroDestinations")}</ToggleButton>
            <ToggleButton value={TYPE_WIDE_ANGLE}>{t("wideAngleDestinations")}</ToggleButton>
        </ToggleButtonGroup>
    );
}

const DestinationsComponent = withLoading(({destinations}) => {

    const t = useTranslation("pages.destinations");

    const [filteredDestinations, setFilteredDestinations] = useState(destinations);
    const [destinationType, setDestinationType] = useState(() => TYPE_ALL);
    const [destinationsView, setDestinationsView] = useState(VIEW_GRID);

    const [regionFilterSet, setRegionFilterSet] = useState(null);
    const [keywordFilterSet, setKeywordFilterSet] = useState(null);
    const [dateFilterSet, setDateFilterSet] = useState(null);

    const [filterTab, setFilterTab] = useState(FILTER_REGION);

    // Use these versions as component key to force remount the filters when they are cleared,
    // to reset their internal state (for example the text in the keyword filter input)
    const [regionFilterVersion, setRegionFilterVersion] = useState(0);
    const [keywordFilterVersion, setKeywordFilterVersion] = useState(0);
    const [dateFilterVersion, setDateFilterVersion] = useState(0);

    useEffect(() => {

        const filterDestinationsByRegion = (destinations) => {
            if (!destinations) return null;
            if (regionFilterSet === null || regionFilterSet.size === 0) {
                return destinations;
            }
            return destinations.filter(destination => destination.regionpath.find(region => regionFilterSet.has(region.id)))
        }

        const filterDestinationsByType = (destinations) => {
            if (!destinations) return null;
            return destinations.filter(destination => destinationType === TYPE_ALL || destination[destinationType]);
        }

        const filterDestinationsByKeyword = (destinations) => {
            if (!keywordFilterSet || keywordFilterSet.size === 0) {
                return destinations;
            }
            // {
            //     title: "BASSE Californie",
            //     title_en: "BAJA California",
            //     regionpath: [
            //         {
            //              id: 21,
            //              title: "Mexique",
            //              title_en: "Mexico",
            //              parent: 1,
            //         },
            //         {
            //              id: 1,
            //              title: "Pacifique Nord",
            //              title_en: "North Pacific",
            //              parent: null,
            //         },
            //     ],
            //     ....
            // }
            return destinations.filter(destination => {
                // Build a string that contains the title, title_en, the tags
                // and all title/title_en from the region path
                const destinationString = `${destination.title} ${destination.title_en} ${destination.location_title ?? ''} ${destination.tags?.join(' ') ?? ''} ${destination.regionpath.map(region => `${region.title} ${region.title_en}`).join(' ')}`;
                // Check if all keywords are included in this string
                return Array.from(keywordFilterSet).every(keyword => destinationString.toLowerCase().includes(keyword.toLowerCase()));
            });
        }

        const filterDestinationsByDate = (destinations) => {
            if (!dateFilterSet || dateFilterSet.size === 0) {
                return destinations;
            }
            return destinations.filter(destination => {
                // destination.date = '2022-11-18T00:00:00.000Z'
                return dateFilterSet.has(new Date(destination.date).getFullYear().toString());
            });
        }

        const filters = [
            filterDestinationsByRegion,
            filterDestinationsByKeyword,
            filterDestinationsByType,
            filterDestinationsByDate
        ];

        setFilteredDestinations(filters.reduce((currentDestinations, filter) => filter(currentDestinations), destinations));

    }, [regionFilterSet, keywordFilterSet, dateFilterSet, destinationType, destinations]);

    const handleChangeDestinationTypes = (event, newType) => {
        if (newType !== null) {
            setDestinationType(newType);
        }
    };

    const handleChangeDestinationView = (event, newValue) => {
        if (newValue !== null) {
            setDestinationsView(newValue);
        }
    };

    const handleRegionFilterChange = (regionSet) => {
        if (regionSet === null || regionSet.size === 0) {
            setRegionFilterSet(null);
        } else {
            setRegionFilterSet(regionSet);
        }
        setRegionFilterSet(regionSet);
    };

    const handleKeywordFilterChange = (keywordSet) => {
        setKeywordFilterSet(keywordSet);
    };

    const handleDateFilterChange = (dateSet) => {
        setDateFilterSet(dateSet);
    };

    const onChangeSearchTabIndex = React.useCallback((event, newValue) => {
        setFilterTab(newValue);
    }, []);

    const clearFilter = React.useCallback((filterId) => {
         switch(filterId) {
            case FILTER_REGION:
                setRegionFilterSet(null);
                setRegionFilterVersion(prev => prev + 1);
                break;
            case FILTER_KEYWORD:
                setKeywordFilterSet(null);
                setKeywordFilterVersion(prev => prev + 1);
                break;
            case FILTER_DATE:
                setDateFilterSet(null);
                setDateFilterVersion(prev => prev + 1);
                break;
            default:
                break;
         }
     }, []);

     const hasFilter = React.useCallback((filterId) => {
        switch(filterId) {
            case FILTER_REGION:
                return regionFilterSet && regionFilterSet.size > 0;
            case FILTER_KEYWORD:
                return keywordFilterSet && keywordFilterSet.size > 0;
            case FILTER_DATE:
                return dateFilterSet && dateFilterSet.size > 0;
            default:
                return false;
        }
     }, [regionFilterSet, keywordFilterSet, dateFilterSet]);

     const tabCaption = React.useCallback((captionKey, filterId) => {
        const onClearFilter = React.useCallback((e) => {
            e.stopPropagation(); // Don't trigger the tab change when clicking on the clear filter button
            clearFilter(filterId);
        }, [filterId]);

        return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
                {t(captionKey)}
                {
                    hasFilter(filterId) &&
                    <IconButton size="small" color="warning" sx={{ ml: 0.5, mr: 0}} onClick={onClearFilter}>
                        <HighlightOffIcon fontSize="small" />
                    </IconButton>
                }
            </Stack>
        )
     }, [t, clearFilter, hasFilter]);

    return (
        <React.Fragment>
            <PictureTypeSelector destinationType={destinationType} onChange={handleChangeDestinationTypes} /> 
            <VerticalSpacing factor={2} />

            <Tabs
                value={filterTab}
                onChange={onChangeSearchTabIndex}
                textColor="secondary"
                indicatorColor="secondary"
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab key={FILTER_REGION} sx={{ fontWeight: hasFilter(FILTER_REGION) ? "bold" : "normal" }} label={tabCaption("filterTab:byRegions", FILTER_REGION)} />
                <Tab key={FILTER_KEYWORD} sx={{ fontWeight: hasFilter(FILTER_KEYWORD) ? "bold" : "normal" }} label={tabCaption("filterTab:byKeywords", FILTER_KEYWORD)} />
                <Tab key={FILTER_DATE} sx={{ fontWeight: hasFilter(FILTER_DATE) ? "bold" : "normal" }} label={tabCaption("filterTab:byYear", FILTER_DATE)} />
            </Tabs>
            <Box
                sx={{
                    width: '95%',
                    maxWidth: 700,
                    mt: 2
                }}
            >
                <Fade in={filterTab === FILTER_REGION} >
                    <Box sx={{ mb: 2, display: filterTab === FILTER_REGION ? 'block' : 'none' }} >
                        <RegionFilter key={regionFilterVersion} destinations={destinations} onChange={handleRegionFilterChange} />
                    </Box>
                </Fade>
                <Fade in={filterTab === FILTER_KEYWORD} >
                    <Box sx={{ mb: 2, display: filterTab === FILTER_KEYWORD ? 'block' : 'none' }} >
                        <KeyWordFilter key={keywordFilterVersion} onChange={handleKeywordFilterChange} />
                    </Box>
                </Fade>
                <Fade in={filterTab === FILTER_DATE} >
                    <Box sx={{ mb: 2, display: filterTab === FILTER_DATE ? 'block' : 'none' }} >
                        <DateFilter key={dateFilterVersion} destinations={destinations} onChange={handleDateFilterChange} />
                    </Box>
                </Fade>
            </Box>
            {
                filteredDestinations && filteredDestinations.length > 0 &&
                <Paragraph>{t("count", filteredDestinations.length)}</Paragraph>
            }
            {
                filteredDestinations && filteredDestinations.length === 0 &&
                <Alert severity="warning">{t("noDestinationsFound")}</Alert>
            }
            <VerticalSpacing factor={2} />
            <DisplayModeSelector listType={destinationsView} onChange={handleChangeDestinationView} />
            <VerticalSpacing factor={2} />
            <TabContext value={destinationsView}>
                <DestinationTabPanel 
                    value={VIEW_GRID}
                >
                    <DestinationGallery destinations={filteredDestinations} />
                </DestinationTabPanel>
                <DestinationTabPanel 
                    value={VIEW_MAP}
                    sx={{
                        height: '500px'
                    }}
                >
                    <DestinationsMap destinations={filteredDestinations} />
                </DestinationTabPanel>
            </TabContext>
        </React.Fragment>
    )
}, [
    buildLoadingState("destinations", [null, undefined]),
    buildLoadingState("regionHierarchy", [null]),
]);

const DestinationsController = () => {

    const t = useTranslation("pages.destinations");
    const queryContext = useQueryContext();

    // Fetch Destinations & Regions
    const { data: destinations } = useReactQuery(queryContext.useFetchDestinations);

    return (
        <React.Fragment>
            <PageTitle>{t("title")}</PageTitle>
            <VerticalSpacing factor={2} />
            <DestinationsComponent destinations={destinations} />
        </React.Fragment>
    )

}

export default DestinationsController;