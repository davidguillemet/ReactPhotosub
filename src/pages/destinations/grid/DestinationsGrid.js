import React, { useMemo } from 'react';
import GridList from "@material-ui/core/GridList";
import { makeStyles } from '@material-ui/core/styles';

import { getThumbnailSrc } from '../../../utils/utils';
import Destination from './Destination';

const useStyles = makeStyles((theme) => ({
    gridList: {
        margin: 0,
        width: '100%',
        '& > *': {
            margin: 5,
        },
    }
}));

const DestinationsGrid = ({destinations, regionsByDestination}) => {

    const classes = useStyles();

    const adaptedDestinations = useMemo(() => {
        return destinations.map(destination => {
            return {
                ...destination,
                // Maybe we should compute the size ans use resizeObserver instead of using hard-coded thumb size??
                cover: getThumbnailSrc(destination.cover, 500)
            }
        })

    }, [destinations]);

    return (
        <GridList
            component="div"
            classes={{
                root: classes.gridList
            }}
        >
            {
                adaptedDestinations.map(item => <Destination key={item.id} destination={item} regions={regionsByDestination.get(item.id)} />)
            }
        </GridList>
    );
}

export default DestinationsGrid;