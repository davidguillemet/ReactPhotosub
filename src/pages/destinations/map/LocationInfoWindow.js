import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DestinationLink from '../../../components/destinationLink';

const useStyles = makeStyles((theme) => ({
    locationTitle: {
        overflow: "hidden",
        marginBottom: 5,
        '& > h2': {
            marginTop: 0,
            marginBottom: 0
        }
    },
    link: {
        width: 18,
        height: 18,
        float: "left",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z'/%3E%3C/svg%3E\")"
    },
    linkLabel: {
        fontWeight: "bold",
        fontSize: 16,
        float: "left",
        marginRight: 10
    },
    tripsGalery: {
        display: "flex",
        overflowX: "scroll",
        overflowY: "hidden",
        maxWidth: 310,
        height: "auto",
        marginTop: 5
    },
    tripCard: {
        position: "relative",
        display: "flex",
        marginRight: 5,
        '&:last-child': {
            marginRight: 0
        }
    },
    tripCover: {
        borderRadius: 5
    },
    tripDateContainer: {
        display: "flex",
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 30,
        overflow: "hidden"
    },
    tripDateBg: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        opacity: 0.3
    },
    tripDateLabel: {
        color: "white",
        opacity: 0.8,
        fontWeight: "bold",
        margin: "auto"
    }
}));

const LocationInfoWindow = ({location, coverWidth}) => {

    const classes = useStyles();

    return (
        <div id="content">
            <div className={classes.locationTitle}>
                <h2>{location.destinations[0].title}</h2>
            </div>
            <div className={classes.locationTitle}>
                <div className={classes.linkLabel}>{location.title}</div>
                {
                    location.link && location.link.length > 0 &&
                    <a href={location.link} target="_blank" rel="noreferrer"><div className={classes.link}></div></a>
                }
            </div>
            <div className={classes.tripsGalery}>
            {
                location.destinations.map(destination => {
                    return (
                        <div className={classes.tripCard} key={destination.id}>
                            <DestinationLink destination={destination}>
                                <img alt="" src={destination.cover} className={classes.tripCover} width={coverWidth} />
                                <div className={classes.tripDateContainer}>
                                    <div className={classes.tripDateBg}></div>
                                    <div className={classes.tripDateLabel}>{destination.date}</div>
                                </div>
                            </DestinationLink>
                        </div>
                    );
                })
            }
            </div>
        </div>
    );
}

export default LocationInfoWindow;
