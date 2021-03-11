import GridListTile from "@material-ui/core/GridListTile"
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import StarBorderIcon from '@material-ui/icons/StarBorder';
import { makeStyles } from '@material-ui/core/styles';
import { easing, duration } from '@material-ui/core/styles/transitions';
import { formatDate } from '../../utils/utils';
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import React from "react";

const useStyles = makeStyles((theme) => ({
    tileRoot: {
        position: 'relative',
        overflow: 'hidden',
        height: 'auto !important',
        borderRadius: 5,
        '&:hover': {
            boxShadow: '0px 3px 3px -2px rgb(0 0 0 / 20%), 0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%)',
            top: -2,
            left: -2
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
        '& > div' : {
            transition: theme.transitions.create(
                'bottom',
                {
                    duration: duration.standard,
                    easing: easing.easeOut
                }
            )
        },
        '&:hover > div': {
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
                    easing: easing.easeOut
                }
            )
        },
        '&:hover img': {
            transform: 'scale(1.05)'
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
    },
}));

const DestinationDetails = ({destination, regions}) => {

    return (
        <React.Fragment>
            <Typography variant="h6">{destination.title}</Typography>
            {regions.map((region, index) => {
                return (
                    <Chip size="small"
                          key={region.id}
                          label={<Typography variant="caption">{region.title}</Typography>}
                          style={{
                              marginLeft: index > 0 ? 5 : 0
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
                actionIcon={
                    <IconButton aria-label={`star ${destination.title}`} className={classes.icon}>
                        <StarBorderIcon />
                    </IconButton>
                }
            />
        </GridListTile>
    );
}

export default Destination;