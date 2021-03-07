import { useState, useEffect } from 'react';
import Destination from './Destination';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import GridList from "@material-ui/core/GridList";
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        overflow: 'hidden',
        '& > *': {
            margin: theme.spacing(0.5),
        }
    },
    gridList: {
      width: '100%',
      '& > *': {
        margin: theme.spacing(0.5),
    },
    regionContainer: {
        '& *': {
            margin: theme.spacing(0.5),
        }
    }
},
}));

function getDestinations() {
    const item = {
		"title": "Misool",
		"date": "2014-07-10T00:00:00.000Z",
		"location": 15,
		"path": "2014/misool/",
		"cover": "http://localhost:3000/static-storage/2014/misool/DSC_1425.jpg",
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

const Destinations = () => {
    const classes = useStyles();
    const [destinations, setDestinations] = useState([]);
    const [regions, setRegions] = useState({
        map: {},
        all: []
    });
    const [currentRegionState, setCurrentRegionState] = useState({
        region: null,
        subRegions: []
    });

    useEffect(() => {
        getDestinations().then(items => {
            setDestinations(items);
        });
    }, []);
    useEffect(() => {
        getRegions().then(items => {
                        
            const regionMap = new Map();
            items.forEach(region => {
                regionMap[region._id] = region;
            })
            setRegions({
                map: regionMap,
                all: items
            });
            const childRegions = items.filter(region => region.parent === null);
            setCurrentRegionState({
                region: null,
                subRegions: childRegions
            });
        });
    }, []);

    function setCurrentRegion(regionId) {
        const childRegions = regions.all.filter(region => region.parent === regionId);
        setCurrentRegionState({
            region: regionId !== null ? regions.map[regionId] : null,
            subRegions: childRegions
        });
    }

    const handleRegionClick = (region) => () => {
        setCurrentRegion(region.id);
    }

    function RegionPath() {
        if (currentRegionState.region === null || currentRegionState.region === undefined) {
            return "Toutes les régions";
        } else {
            return currentRegionState.region.title;
        }
    }

    return (
        <div className={classes.root}>
            <RegionPath></RegionPath>
            <Paper variant="elevation" elevation={0} className={classes.regionContainer}>
                {currentRegionState.subRegions.map(region => <Chip key={region.id} label={region.title} onClick={handleRegionClick(region)} />)}
            </Paper>
            <GridList cellHeight={180} padding={10} spacing={5} classes={{
                    root: classes.gridList
                }}>
                {destinations.map(item => <Destination key={item.id} {...item} />)}
            </GridList>
        </div>
    )
};

//export default withWidth()(Destinations);
export default Destinations;