import React, { useState, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import AppsIcon from '@mui/icons-material/Apps';
import PublicIcon from '@mui/icons-material/Public';
import { makeStyles } from '@mui/styles';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { PageTitle } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import DestinationsMap from '../../components/map';
import RegionFilter from './RegionFilter';
import useRegions from './RegionLoaderHook';
import { useGlobalContext } from '../../components/globalContext';
import DestinationGallery from './DestinationGallery';

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

const Destinations = () => {

    const context = useGlobalContext();
    const classes = useStyles();

    const [filteredDestinations, setFilteredDestinations] = useState(null);
    const [regionsByDestination, setRegionsByDestination] = useState(null);
    const [destinationsView, setDestinationsView] = useState(VIEW_GRID);
    const [regionHierarchy, regionMap] = useRegions();
    const [regionFilterSet, setRegionFilterSet] = useState(null);

    // Fetch Destinations
    const { data: allDestinations } = context.useFetchDestinations();
    
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
        unstable_batchedUpdates(() => {
            setRegionsByDestination(regionsByDestination);
            setFilteredDestinations(allDestinations);
        });

    }, [allDestinations, regionMap])

    useEffect(() => {
        if (allDestinations === undefined || regionsByDestination === null || regionFilterSet === null) {
            return;
        }

        // filter by region
        const resultsByRegion =
            regionFilterSet.size === 0 ?
            allDestinations :
            allDestinations.filter(destination => regionsByDestination.get(destination.id).find(destRegion => regionFilterSet.has(destRegion.id)))

        // filter by keyword
        // TODO
        const resultsByRegionAndKeyword = resultsByRegion;

        setFilteredDestinations(resultsByRegionAndKeyword);
    }, [regionFilterSet, allDestinations, regionsByDestination]);

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
            <PageTitle>Toutes Les Destinations</PageTitle>
            <VerticalSpacing factor={2} />
            <RegionFilter hierarchy={regionHierarchy} onChange={handleRegionFilterChange} regionsByDestination={regionsByDestination}/>
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
};

export default Destinations;