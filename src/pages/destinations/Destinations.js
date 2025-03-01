import React, { useState, useEffect } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import AppsIcon from '@mui/icons-material/Apps';
import PublicIcon from '@mui/icons-material/Public';
import { styled } from '@mui/material/styles';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { PageTitle, Paragraph } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import { DestinationsMap } from '../../components/map';
import RegionFilter from './RegionFilter';
import { useQueryContext } from '../../components/queryContext';
import DestinationGallery from './DestinationGallery';
import { buildLoadingState, withLoading } from '../../components/hoc';
import { isMobile } from 'react-device-detect';

import { useReactQuery } from '../../components/reactQuery';
import { useTranslation } from '../../utils';

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
            size={isMobile ? "small" : "medium"}
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

    useEffect(() => {

        const filterDestinationsByRegion = (destinations) => {
            if (!destinations) return null;
            if (regionFilterSet === null || regionFilterSet.size === 0) {
                return destinations;
            }
            return destinations.filter(destination => destination.regionpath.find(region => regionFilterSet.has(region.id)))
        }

        const filterDestinationsByKeyword = (destinations) => {
            return destinations;
        }

        const filterDestinationsByType = (destinations) => {
            if (!destinations) return null;
            return destinations.filter(destination => destinationType === TYPE_ALL || destination[destinationType]);
        }

        const filters = [
            filterDestinationsByRegion,
            filterDestinationsByKeyword,
            filterDestinationsByType
        ];

        setFilteredDestinations(filters.reduce((currentDestinations, filter) => filter(currentDestinations), destinations));

    }, [regionFilterSet, destinationType, destinations]);

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
        setRegionFilterSet(regionSet);
    };

    return (
        <React.Fragment>
            <PictureTypeSelector destinationType={destinationType} onChange={handleChangeDestinationTypes} /> 
            <VerticalSpacing factor={2} />
            <RegionFilter destinations={destinations} onChange={handleRegionFilterChange} />
            {
                filteredDestinations &&
                <Paragraph>{t("count", filteredDestinations.length)}</Paragraph>
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