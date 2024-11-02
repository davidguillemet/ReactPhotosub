import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import DestinationLink from '../destinationLink';
import { useLanguage, destinationTitle, getSubGalleryAnchorName } from 'utils';

const PREFIX = 'MapInfoWindow';
const makeClassName = (name) => `${PREFIX}-${name}`

const classes = {
    root: makeClassName('root'),
    locationTitle: makeClassName('locationTitle'),
    link: makeClassName('link'),
    linkLabel: makeClassName('linkLabel'),
    tripsGallery: makeClassName('tripsGallery'),
    tripCard: makeClassName('tripCard'),
    tripCover: makeClassName('tripCover'),
    tripDateContainer: makeClassName('tripDateContainer'),
    tripDateBg: makeClassName('tripDateBg'),
    tripDateLabel: makeClassName('tripDateLabel')
};

const InfoWindowContainer = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        color: 'black'
    },
    [`& .${classes.locationTitle}`]: {
        overflow: "hidden",
        marginBottom: 5,
        '& > h2': {
            marginTop: 0,
            marginBottom: 0,
        }
    },
    [`& .${classes.link}`]: {
        width: 18,
        height: 18,
        float: "left",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z'/%3E%3C/svg%3E\")"
    },
    [`& .${classes.linkLabel}`]: {
        fontWeight: "bold",
        fontSize: 16,
        float: "left",
        marginRight: 10
    },
    [`& .${classes.tripsGallery}`]: {
        display: "flex",
        overflowX: "auto",
        overflowY: "hidden",
        maxWidth: 310,
        height: "auto",
        marginTop: 5
    },
    [`& .${classes.tripCard}`]: {
        position: "relative",
        display: "flex",
        marginRight: 5,
        '&:last-child': {
            marginRight: 0
        }
    },
    [`& .${classes.tripCover}`]: {
        borderRadius: 5
    },
    [`& .${classes.tripDateContainer}`]: {
        display: "flex",
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 30,
        overflow: "hidden"
    },
    [`& .${classes.tripDateBg}`]: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        opacity: 0.3
    },
    [`& .${classes.tripDateLabel}`]: {
        color: "white",
        opacity: 0.8,
        fontWeight: "bold",
        margin: "auto"
    },
}));

const LocationTitleLink = ({isDestinationPage, title, children}) => {

    const onClickGallery = React.useCallback(() => {
        window.location.hash = getSubGalleryAnchorName(title);
    }, [title]);

    if (isDestinationPage) {
        return (
            <Button onClick={onClickGallery}>
                {children}
            </Button>
        )
    } else {
        return children
    }
}

const LocationInfoWindow = ({location, coverWidth, isDestinationPage}) => {

    const { language } = useLanguage();
    const infoTitle = destinationTitle(location.destinations[0], language);

    return (
        <InfoWindowContainer className={classes.root} id="content">
            <div className={classes.locationTitle}>
                <h2>
                    <LocationTitleLink isDestinationPage={isDestinationPage} title={infoTitle}>
                        {infoTitle}
                    </LocationTitleLink>
                </h2>
            </div>
            { 
                isDestinationPage === false &&
                <React.Fragment>
                <div className={classes.locationTitle}>
                    <div className={classes.linkLabel}>{location.title}</div>
                    {
                        location.link && location.link.length > 0 &&
                        <a href={location.link} target="_blank" rel="noreferrer"><div className={classes.link}></div></a>
                    }
                </div>
                <div className={classes.tripsGallery}>
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
                </React.Fragment>
            }
        </InfoWindowContainer>
    );
}

export default LocationInfoWindow;
