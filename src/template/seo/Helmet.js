import React, { useMemo } from 'react';
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { getThumbnailSrc, formatDate } from '../../utils';

const _pageNamePlaceHolder = '{title}';
const _descriptionTemplate = `${_pageNamePlaceHolder} | David Guillemet - Underwater Photography`;
const _shortTitleTemplate = `${_pageNamePlaceHolder} | David Guillemet`;
const _defaultImage = "https://storage.googleapis.com/photosub.appspot.com/2017/rajaampat/DSC_5683.jpg";
const _imageWidth = 1200;
const _imageHeight = 800;

const buildFullDescription = (title) => {
    return title ? _descriptionTemplate.replace(_pageNamePlaceHolder, title) : null;
}

const buildShortTitle = (title) => {
    return title ? _shortTitleTemplate.replace(_pageNamePlaceHolder, title) : null;
}

const buildDescription = (description, title) => {
    return description || buildFullDescription(title);
}

export const HelmetFull = ({ route }) => {
    const pageName = route.label;
    const description = route.description;
    return (
        <React.Fragment>
            <HelmetCommon />
            <HelmetTitle title={pageName} />
            <HelmetDescription description={description} title={pageName} />
            <HelmetImage image={_defaultImage} />
        </React.Fragment>
    );
};

export const HelmetCommon = () => {
    const location = useLocation();
    const pageUrl = useMemo(() => `https://www.davidphotosub.com${location.pathname}${location.search}`, [location]);
    return (
        <Helmet>
            <meta name="google-site-verification" content="MV0EsGEbTYaJwYgzMrID484Xbvp7Hk3An8RSGU-c6Us" />
            <meta charset="utf-8" />
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />

            <meta name="apple-mobile-web-app-title" content="David Guillemet - Underwater Photography" />
            <meta name="apple-mobile-web-app-capable" content="yes" />

            <meta name="msapplication-TileColor" content="#da532c" />
            <meta name="theme-color" content="#ffffff" />

            <meta property="og:url" content={pageUrl} />
            {/* Use article for articles and website for the rest of your pages */}
            <meta property="og:type" content="website" />
            <meta property="og:locale" content="fr_FR" />

            <meta name="twitter:url" content={pageUrl} />
            {/* summary, photo, video, product, app, gallery */}
            <meta name="twitter:card" content="summary" />
        </Helmet>
    )
};

export const HelmetImage = ({image}) => {
    const fullImage = useMemo(() => getThumbnailSrc(image, _imageWidth), [image]);
    return (
        <Helmet>
            {/* Open graph image = Large thumbs 1200*800 */}
            <meta property="og:image" content={fullImage} />
            <meta property="og:image:width" content={_imageWidth} />
            <meta property="og:image:height" content={_imageHeight} />
            
            <meta name="twitter:image" content={fullImage} />
        </Helmet>
    );
}

export const HelmetTitle = ({title}) => {
    const fullTitle = useMemo(() => buildFullDescription(title), [title]);
    const shortTitle = useMemo(() => buildShortTitle(title), [title]);
    return fullTitle ?
        <Helmet>
            <title>{shortTitle}</title>
            <meta property="og:title" content={fullTitle} />
            <meta name="twitter:title" content={fullTitle} />
        </Helmet> :
        null;
}

export const HelmetDescription = ({description, title}) => {
    const fullDescription = useMemo(() => buildDescription(description, title), [description, title]);
    return fullDescription ?
        <Helmet>
            <meta name="description" content={fullDescription}></meta>
            <meta property="og:description" content={fullDescription} />
            <meta name="twitter:description" content={fullDescription} />
        </Helmet> :
        null;
}

export const HelmetDestination = ({destination}) => {
    const destinationDate = useMemo(() => new Date(destination.date), [destination]);
    const formattedDate = useMemo(() => formatDate(destinationDate), [destinationDate]);
    const customTitle = `${destination.title} - ${formattedDate}`;

    return (
        <React.Fragment>
            <HelmetTitle title={customTitle} />
            <HelmetDescription description={destination.description} title={customTitle}/>
            <HelmetImage image={destination.cover} />
        </React.Fragment>
    )
}

export const Helmet404 = () => {
    return (
        <Helmet>
            <meta name="prerender-status-code" content="404"></meta>
        </Helmet>
    )
}
