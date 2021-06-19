import GridListTile from "@material-ui/core/GridListTile"
import GridListTileBar from "@material-ui/core/GridListTileBar";
import { makeStyles } from '@material-ui/core/styles';
import { easing, duration } from '@material-ui/core/styles/transitions';
import { formatDate } from '../../../utils/utils';
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import React from "react";
import DestinationLink from '../../../components/destinationLink';

const useStyles = makeStyles((theme) => ({
    tileRoot: {
        position: 'relative',
        overflow: 'hidden',
        height: 'auto !important',
        borderRadius: 5,
        transition: theme.transitions.create(
            'transform',
            {
                duration: duration.standard,
                easing: easing.easeOut
            }
        ),
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '5px 10px 10px 0 rgb(74 74 74 / 40%)',
            //transform: 'scale(1.02)',
            //boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 40%), 0px 3px 4px 0px rgb(0 0 0 / 25%), 0px 1px 8px 0px rgb(0 0 0 / 20%)',
            top: 0,
            left: 0
        },
        [theme.breakpoints.only('xs')]: {
            width: 'calc(100% - 10px)',
        },
        [theme.breakpoints.only('sm')]: {
            width: 'calc(50% - 10px)',
        },
        [theme.breakpoints.only('md')]: {
            width: 'calc(33.33% - 10px)',
        },
        [theme.breakpoints.only('lg')]: {
            width: 'calc(25% - 10px)',
        },
        [theme.breakpoints.up('xl')]: {
            width: 'calc(20% - 10px)',
        },
    },
    tile: {
        position: 'relative',
        '& > a > div' : {
            transition: theme.transitions.create(
                'bottom',
                {
                    duration: duration.standard,
                    easing: easing.easeOut
                }
            )
        },
        '&:hover > a > div': {
            bottom: 0
        },
        '& div[class*="actionIcon"]' : {
            opacity: 0,
            transition: theme.transitions.create(
                'opacity',
                {
                    duration: duration.standard,
                    easing: easing.easeOut
                }
            )
        },
        '&:hover div[class*="actionIcon"]': {
            opacity: 1
        },
        '& img': {
            transition: theme.transitions.create(
                'transform',
                {
                    duration: 1000,
                    easing: easing.easeOut,
                    delay: duration.standard - 100
                }
            )
        },
        '&:hover img': {
            transform: 'scale(1.02)'
        }
    },
    imgFullHeight: {
        left: 0,
        transform: 'none'
    },
    imgFullWidth: {
        top: 0,
        transform: 'none'
    },
    titleBar: {
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
        position: 'absolute',
        height: 'auto',
        paddingBottom: 5,
        bottom: -60
    },
    icon: {
        color: 'white',
    }
}));

const detailStyles = makeStyles((theme) => ({
    regionChipOutlinedPrimary: {
        color: '#fff',
        border: '1px solid #fff'
    }
}));

const DestinationDetails = ({destination, regions}) => {
    const classes = detailStyles();

    return (
        <React.Fragment>
            <Typography variant="h6">{destination.title}</Typography>
            {regions.map((region, index) => {
                return (
                    <Chip size="small"
                          key={region.id}
                          label={<Typography variant="caption">{region.title}</Typography>}
                          variant="outlined"
                          color="primary"
                          style={{
                              marginLeft: index > 0 ? 5 : 0
                          }}
                          classes={{
                              outlinedPrimary: classes.regionChipOutlinedPrimary
                          }}
                    />
                );
            })}
        </React.Fragment>
    );
} 

const Destination = ({destination, regions}) => {
    const classes = useStyles();

    return (
        <GridListTile component="div" key={destination.id} classes={{
                root: classes.tileRoot,
                tile: classes.tile,
                imgFullHeight: classes.imgFullHeight,
                imgFullWidth: classes.imgFullWidth
            }}>
            <DestinationLink destination={destination}>
                <img src={destination.cover} alt={destination.title} style={{
                    height: '100%',
                    width: '100%'
                }}/>
                <GridListTileBar
                    classes={{
                        root: classes.titleBar,
                    }}
                    title={<Typography variant="h5">{formatDate(new Date(destination.date))}</Typography>}
                    subtitle={<DestinationDetails destination={destination} regions={regions} />}
                />
            </DestinationLink>
        </GridListTile>
    );
}

export default Destination;