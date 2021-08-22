import React, { useState, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import TabContext from '@material-ui/lab/TabContext';
import TabPanel from '@material-ui/lab/TabPanel';
import AppsIcon from '@material-ui/icons/Apps';
import PublicIcon from '@material-ui/icons/Public';
import { makeStyles } from '@material-ui/styles';

import ToggleButton from '@material-ui/core/ToggleButton';
import ToggleButtonGroup from '@material-ui/core/ToggleButtonGroup';

import dataProvider from '../../dataProvider';
import { PageTitle } from '../../template/pageTypography';
import { VerticalSpacing } from '../../template/spacing';
import DestinationsGrid from './grid/DestinationsGrid';
import DestinationsMap from '../../components/map';
import RegionFilter from './RegionFilter';
import useRegions from './RegionLoaderHook';

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

    const classes = useStyles();

    const [allDestinations, setAllDestinations] = useState(null);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [regionsByDestination, setRegionsByDestination] = useState(null);
    const [destinationsView, setDestinationsView] = useState(VIEW_GRID);
    const [regionHierarchy, regionMap] = useRegions();
    const [regionFilterSet, setRegionFilterSet] = useState(null);

    // Another effect executed only to load destinations
    useEffect(() => {
        dataProvider.getDestinations().then(destinations => {
            setAllDestinations(destinations);
        });
    }, []); 

    useEffect(() => {
        if (regionMap === null || allDestinations == null) {
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
        if (allDestinations === null || regionsByDestination === null || regionFilterSet === null) {
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
        setDestinationsView(newValue);
    };

    const handleRegionFilterChange = (regionSet) => {
        setRegionFilterSet(regionSet);
    };

    return (
        <React.Fragment>
            <PageTitle>Toutes Les Destinations</PageTitle>
            <VerticalSpacing factor={2} />
            <RegionFilter hierarchy={regionHierarchy} onChange={handleRegionFilterChange} />
            <VerticalSpacing factor={2} />
            <DisplayModeSelector listType={destinationsView} onChange={handleChangeDestinationView} />
            <TabContext value={destinationsView}>
                <TabPanel 
                    value={VIEW_GRID}
                    classes={{
                        root: classes.tabPanel
                    }}
                >
                    <VerticalSpacing factor={2} />
                    <DestinationsGrid destinations={filteredDestinations} regionsByDestination={regionsByDestination} />
                </TabPanel>
                <TabPanel 
                    value={VIEW_MAP}
                    classes={{
                        root: classes.tabPanel
                    }}
                >
                    <VerticalSpacing factor={2} />
                    <DestinationsMap destinations={filteredDestinations} />
                </TabPanel>
            </TabContext>
        </React.Fragment>
    )
};

export default Destinations;