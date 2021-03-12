import { useState, useEffect } from 'react';
import Destination from './Destination';
import GridList from "@material-ui/core/GridList";
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 0,
        width: '100%',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
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

function getDestinations() {
    const item = {
		"title": "Misool",
		"date": "2014-07-10T00:00:00.000Z",
		"location": 15,
		"path": "2014/misool/",
		"cover": "http://localhost:3000/static-storage/2014/misool/DSC_1425.jpg",
        "region": 20, // TODO get the region where location is 15
		"id": 1
	}
    const items = [];
    items.push({...item, id: 1});
    items.push({...item, id: 2});
    items.push({...item, id: 3});
    items.push({...item, id: 4});
    items.push({...item, id: 5});
    items.push({...item, id: 6});
    items.push({...item, id: 7});
    items.push({...item, id: 8});
    items.push({...item, id: 9});
    return Promise.resolve(items);
    /*
    return fetch("/api/destinations")
    .then(data => {
        return data.json();
    });
    */
}

function getRegions() {
    const regions = [{"title":"Pacifique Nord","parent":null,"id":1},{"title":"Mer Rouge","parent":null,"id":2},{"title":"Méditerranée","parent":null,"id":3},{"title":"Atlantique Nord","parent":null,"id":4},{"title":"Asie du Sud-Est","parent":null,"id":5},{"title":"Océan Indien","parent":null,"id":6},{"title":"Espagne","parent":3,"id":7},{"title":"Caraïbes","parent":4,"id":8},{"title":"France","parent":4,"id":9},{"title":"Cap-Vert","parent":4,"id":10},{"title":"Açores","parent":4,"id":11},{"title":"Malaisie","parent":5,"id":12},{"title":"Indonésie","parent":5,"id":13},{"title":"Philippines","parent":5,"id":14},{"title":"Afrique du Sud","parent":6,"id":15},{"title":"France","parent":3,"id":16},{"title":"Egypte","parent":2,"id":17},{"title":"Micronésie","parent":1,"id":18},{"title":"Soudan","parent":2,"id":19},{"title":"Raja Ampat","parent":13,"id":20},{"title":"Mexique","parent":1,"id":21},{"title":"Canada","parent":1,"id":22},{"title":"Maldives","parent":6,"id":23}];
    return Promise.resolve(regions);
    /*return fetch("/api/regions")
    .then(data => {
        return data.json();
    });*/
}

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
        console.log("useEffect getRegions")
        getRegions().then(items => {

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
        console.log("useEffect getDestinations")
        if (regionMap === null) {
            // Wait for the region map to be populated
            return;
        }
        getDestinations().then(destinations => {
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
        console.log("useEffect set initia filtered destination.");
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
        <div className={classes.root}>
            <RegionPath></RegionPath>
            <Paper variant="elevation" elevation={0} classes={{ root: classes.regionContainer}}>
                {currentSubRegions.map(region => <Chip key={region.id} label={region.title} onClick={handleRegionClick(region.id)} variant="outlined" />)}
            </Paper>
            <GridList component="div" classes={{
                    root: classes.gridList
                }}>
                {filteredDestinations.map(item => <Destination key={item.id} destination={item} regions={regionsByDestination.get(item.id)} />)}
            </GridList>
        </div>
    )
};

export default Destinations;