import React, { useState, useEffect } from 'react';
import Destination from './Destination';
import GridList from "@material-ui/core/GridList";
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { makeStyles } from '@material-ui/core/styles';
import dataProvider from '../../dataProvider';
import PageTitle from '../../template/pageTitle';

const useStyles = makeStyles((theme) => ({
    gridList: {
        margin: 0,
        width: '100%',
        '& > *': {
            margin: 5,
        },
    },
    regionContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& *': {
            margin: 5,
        }
    }
}));

const ROOT_REGION_ID = -999999;
const ROOT_REGION = {
    title: "Toutes les régions",
    id: ROOT_REGION_ID,
    parent: null
};

function getRegionPath(regionId, regionMap, includeRoot) {

    const regionList = [];
    let parentId = regionId;
    do {
        const region = regionMap.get(parentId);
        regionList.push(region);
        parentId = region.parent;
    } while ((includeRoot === true && parentId !== null) || (includeRoot === false && parentId !== ROOT_REGION_ID))

    return regionList.reverse();
}

const Destinations = () => {

    const classes = useStyles();

    const [allDestinations, setAllDestinations] = useState(null);
    const [filteredDestinations, setFilteredDestinations] = useState([]);

    const [regionMap, setRegionMap] = useState(null);
    const [regionList, setRegionList] = useState([]);
    const [regionsByDestination, setRegionsByDestination] = useState(null);
    const [currentRegion, setCurrentRegion] = useState(ROOT_REGION);
    const [currentSubRegions, setCurrentSubRegions] = useState([]);

    // A first effect executed only once to get regions
    useEffect(() => {
        dataProvider.getRegions().then(items => {

            items.forEach(item => {
                if (item.parent === null) {
                    item.parent = ROOT_REGION_ID;
                }
            });
            setRegionList(items);

            // Build the region lmap (region id -> region)
            const regionMap = new Map();
            // Add the virtual root region in th emap but not in the list...
            regionMap.set(ROOT_REGION_ID, ROOT_REGION)
            items.forEach(region => {
                regionMap.set(region.id, region);
            })
            setRegionMap(regionMap);

            const rootRegions = items.filter(region => region.parent === ROOT_REGION_ID).sort((a, b) => a.title === b.title ? 0 : a.title < b.title ? -1 : 1);
            setCurrentSubRegions(rootRegions);
        })
    }, []);

    // Another effect executed only once when regions has been loaded, to get destinations
    useEffect(() => {
        if (regionMap === null) {
            // Wait for the region map to be populated
            return;
        }
        dataProvider.getDestinations().then(destinations => {
            setAllDestinations(destinations);

            // Build the regions map by destination (destination id -> region list)
            const regionsByDestination = new Map();
            destinations.forEach(destination => {
                regionsByDestination.set(destination.id, getRegionPath(destination.region, regionMap, false));
            });
            setRegionsByDestination(regionsByDestination);
        });
    }, [regionMap]); // regions dependency to load estinations one regions have been initialized

    useEffect(() => {
        if (regionsByDestination === null || allDestinations === null) {
            return;
        }
        setFilteredDestinations(allDestinations);
    }, [regionsByDestination, allDestinations]); // Needs regionsByDestination to update destination cards

    // Another effect executed only once when 
    
    function onRegionClick(regionId) {

        setCurrentRegion(regionMap.get(regionId));
        const subRegions = regionList.filter(region => region.parent === regionId);

        setCurrentSubRegions(subRegions);
        
        // filter by region
        const resultsByRegion = (regionId === ROOT_REGION_ID) ?
            allDestinations :
            allDestinations.filter(destination => regionsByDestination.get(destination.id).find(destRegion => destRegion.id === regionId))

        // filter by keyword
        // TODO
        const resultsByRegionAndKeyword = resultsByRegion;

        setFilteredDestinations(resultsByRegionAndKeyword);
    }

    const handleRegionClick = (regionId) => () => {
        onRegionClick(regionId);
    }

    function RegionPath() {
        if (regionMap === null) {
            return null;
        }
        const ancestors = getRegionPath(currentRegion.id, regionMap, true);
        return (
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} >
                {ancestors.map((region, index, all) => {
                    const clickable = index === all.length - 1 ? false : true;
                    const variant = clickable ? "outlined" : "default";
                    return (
                        <Chip key={region.id} color="primary" label={region.title} variant={variant} clickable={clickable} onClick={handleRegionClick(region.id)} />
                    );
                })}
            </Breadcrumbs>
        )
    }

    return (
        <React.Fragment>
            <PageTitle>Toutes Les Destinations</PageTitle>
            <RegionPath></RegionPath>
            <Paper variant="elevation" elevation={0} classes={{ root: classes.regionContainer}}>
                {currentSubRegions.map(region => <Chip key={region.id} label={region.title} onClick={handleRegionClick(region.id)} variant="outlined" />)}
            </Paper>
            <GridList component="div" classes={{
                    root: classes.gridList
                }}>
                {filteredDestinations.map(item => <Destination key={item.id} destination={item} regions={regionsByDestination.get(item.id)} />)}
            </GridList>
        </React.Fragment>
    )
};

export default Destinations;