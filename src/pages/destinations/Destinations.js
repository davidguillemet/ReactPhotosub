import React, { useState, useEffect } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import AppsIcon from '@mui/icons-material/Apps';
import PublicIcon from '@mui/icons-material/Public';
import { makeStyles } from '@mui/styles';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { PageTitle, Paragraph } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import DestinationsMap from '../../components/map';
import RegionFilter from './RegionFilter';
import useRegions from './RegionLoaderHook';
import { useGlobalContext } from '../../components/globalContext';
import DestinationGallery from './DestinationGallery';
import { buildLoadingState, withLoading } from '../../components/loading';

const useStyles = makeStyles(() => ({
    regionContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& *': {
            margin: 5,
        }
    },
    tabPanel: {
        padding: 0,
        width: '100%'
    }
}));

const VIEW_GRID = 'grid';
const VIEW_MAP = 'map';

const MACRO_TYPE = 'macro';
const WIDE_ANGLE_TYPE = 'wide';

function getRegionPath(regionId, regionMap) {

    const regionList = [];
    let parentId = regionId;
    do {
        const region = regionMap.get(parentId);
        regionList.push(region);
        parentId = region.parent;
    } while (parentId !== null)

    return regionList.reverse();
}

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

const PictureTypeSelector = ({destinationTypes, onChange}) => {

    return (
        <ToggleButtonGroup
            color="primary"
            value={destinationTypes}
            onChange={onChange}
        >
            <ToggleButton value={MACRO_TYPE}>Macro</ToggleButton>
            <ToggleButton value={WIDE_ANGLE_TYPE}>Ambiance</ToggleButton>
        </ToggleButtonGroup>
    );
}

const DestinationsComponent = withLoading(({
    allDestinations,
    regionsByDestination,
    regionHierarchy
}) => {

    const classes = useStyles();

    const [filteredDestinations, setFilteredDestinations] = useState(allDestinations);
    const [destinationTypes, setDestinationTypes] = useState(() => [MACRO_TYPE, WIDE_ANGLE_TYPE]);
    const [destinationsView, setDestinationsView] = useState(VIEW_GRID);
    const [regionFilterSet, setRegionFilterSet] = useState(null);

    useEffect(() => {

        const filterDestinationsByRegion = (destinations) => {
            if (!destinations) return null;
            if (regionFilterSet === null || regionFilterSet.size === 0) {
                return destinations;
            }
            return destinations.filter(destination => regionsByDestination.get(destination.id).find(destRegion => regionFilterSet.has(destRegion.id)))
        }

        const filterDestinationsByKeyword = (destinations) => {
            return destinations;
        }

        const filterDestinationsByType = (destinations) => {
            if (!destinations) return null;
            return destinations.filter(destination => destinationTypes.reduce(
                (currentValue, typePropertyName) => currentValue || destination[typePropertyName],
                false)
            );
        }

        const filters = [
            filterDestinationsByRegion,
            filterDestinationsByKeyword,
            filterDestinationsByType
        ];

        setFilteredDestinations(filters.reduce((currentDestinations, filter) => filter(currentDestinations), allDestinations));

    }, [regionFilterSet, destinationTypes, allDestinations, regionsByDestination]);

    const handleChangeDestinationTypes = (event, newValues) => {
        if (newValues.length > 0)
        {
            setDestinationTypes(newValues);
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
            <PictureTypeSelector destinationTypes={destinationTypes} onChange={handleChangeDestinationTypes} /> 
            <VerticalSpacing factor={2} />
            <RegionFilter hierarchy={regionHierarchy} onChange={handleRegionFilterChange} regionsByDestination={regionsByDestination}/>
            {
                filteredDestinations &&
                <Paragraph>{`${filteredDestinations.length} Destination(s)`}</Paragraph>
            }
            <VerticalSpacing factor={2} />
            <DisplayModeSelector listType={destinationsView} onChange={handleChangeDestinationView} />
            <VerticalSpacing factor={2} />
            <TabContext value={destinationsView}>
                <TabPanel 
                    value={VIEW_GRID}
                    classes={{
                        root: classes.tabPanel
                    }}
                >
                    <DestinationGallery
                        destinations={filteredDestinations}
                        regionsByDestination={regionsByDestination}
                    />
                </TabPanel>
                <TabPanel 
                    value={VIEW_MAP}
                    classes={{
                        root: classes.tabPanel
                    }}
                    sx={{
                        height: '500px'
                    }}
                >
                    <DestinationsMap destinations={filteredDestinations} />
                </TabPanel>
            </TabContext>
        </React.Fragment>
    )
}, [
    buildLoadingState("allDestinations", [null, undefined]),
    buildLoadingState("regionsByDestination", [null]),
    buildLoadingState("regionHierarchy", [null]),
]);

const DestinationsController = () => {

    const context = useGlobalContext();

    const [regionsByDestination, setRegionsByDestination] = useState(null);

    // Fetch Destinations & Regions
    const { data: allDestinations } = context.useFetchDestinations();
    const [regionHierarchy, regionMap] = useRegions();

    useEffect(() => {
        if (regionMap === null || allDestinations === undefined) {
            // Wait for the regions and destinations being loaded
            return;
        }

        // Build the regions map by destination (destination id -> region list)
        const regionsByDestination = new Map();
        allDestinations.forEach(destination => {
            regionsByDestination.set(destination.id, getRegionPath(destination.region, regionMap));
        });
        
        // Needs regionsByDestination to update destination cards
        setRegionsByDestination(regionsByDestination);

    }, [allDestinations, regionMap])

    return (
        <React.Fragment>
            <PageTitle>Toutes Les Destinations</PageTitle>
            <VerticalSpacing factor={2} />
            <DestinationsComponent
                allDestinations={allDestinations}
                regionsByDestination={regionsByDestination}
                regionHierarchy={regionHierarchy}
            />
        </React.Fragment>
    )

}

export default DestinationsController;