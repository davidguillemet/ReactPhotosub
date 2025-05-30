const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const express = require("express");
const preRender = require("prerender-node");
const fs = require("fs");

if (process.env.FUNCTIONS_EMULATOR === "true") {
    preRender.set("prerenderServiceUrl", "http://localhost:3001/");
} else {
    preRender.set("prerenderToken", process.env.PRERENDER_TOKEN);
}

const preRenderApp = express();
preRenderApp.use(preRender);

const _pageNamePlaceHolder = "{title}";
const _descriptionTemplate = `${_pageNamePlaceHolder} | David Guillemet - Underwater Photography`;
const _shortTitleTemplate = `${_pageNamePlaceHolder} | David Guillemet`;
const _defaultImagePath = process.env.OPEN_GRAPH_DEFAULT_IMAGE;
const _imageKitEmulator = process.env.FUNCTIONS_EMULATOR === "true" ? "/emulator" : "";
const _imageKitEndpoint = `https://ik.imagekit.io/lmpvkcer3${_imageKitEmulator}`;

const _destinationRegexp = /\/destinations\/(?<year>[0-9]{4})\/(?<location>[a-z]+)/;
const _imageNameRegexp = /^(?<baseUrl>.+)\/(?<name>[^./]+)\.jpg$/;

const getDestinationProperties = async (year, title, pool) => {
    const data = await pool("destinations").select().where("path", `${year}/${title}`);
    if (data.length > 0) {
        return data[0];
    }
    return null;
};

const toMediumThumbnailUrl = (imagePath, firebaseConfig) => {
    if (process.env.USE_IMAGEKIT === "true") {
        return `${_imageKitEndpoint}/tr:n-medium/${imagePath}`;
    } else {
        const imageFullUrl = firebaseConfig.convertPathToUrl(imagePath);
        const match = imageFullUrl.match(_imageNameRegexp);
        const imageNameWithoutExt = match.groups["name"];
        const baseUrl = match.groups["baseUrl"];
        const thumbSrc = `${baseUrl}/thumbs/${imageNameWithoutExt}_m.jpg`;
        return thumbSrc;
    }
};

const getPageProperties = async (req, pool, firebaseConfig) => {
    let imagePath = _defaultImagePath;
    let pageName = "Home";

    const path = req.path;
    if (path === "/auth/action") {
        pageName = "Account Management";
    } else if (path === "/destinations") {
        pageName = "Destinations";
    } else if (path.startsWith("/destinations")) {
        // /destinations/2020/romblon
        // -> "Romblon - 2020"
        const match = path.match(_destinationRegexp);
        if (match !== null) {
            const year = match.groups["year"];
            const locationCode = match.groups["location"];
            const destination = await getDestinationProperties(year, locationCode, pool);
            if (destination !== null) {
                const locationName = destination.title_en || destination.title;
                imagePath = `${destination.path}/${destination.cover}`;
                pageName = `${locationName} - ${year}`;
            }
        }
    } else if (path === "/search") {
        pageName = "Search";
    } else if (path === "/finning") {
        pageName = "Finning";
    } else if (path === "/composition") {
        pageName = "Composition";
    } else if (path === "/about") {
        pageName = "About";
    } else if (path === "/contact") {
        pageName = "Contact";
    }

    return {
        pageName,
        imageUrl: toMediumThumbnailUrl(imagePath, firebaseConfig),
    };
};

module.exports = function(pool, firebaseConfig) {
    preRenderApp.get("*", (req, res) => {
        return fs.readFile("./web/index.html", "utf8", async (err, htmlData) => {
            const {pageName, imageUrl} = await getPageProperties(req, pool, firebaseConfig);
            const title = _shortTitleTemplate.replace(_pageNamePlaceHolder, pageName);
            const description = _descriptionTemplate.replace(_pageNamePlaceHolder, pageName);
            htmlData = htmlData
                .replace(/__HTML_TITLE__/g, title)
                .replace(/__META_TITLE__/g, description)
                .replace(/__META_DESCRIPTION__/g, description)
                .replace(/__META_IMAGE__/g, imageUrl);
            return res.send(htmlData);
        });
    });

    const preRenderToken = defineSecret("PRERENDER_TOKEN");
    const preRender = onRequest({secrets: [
        preRenderToken,
    ]}, preRenderApp);

    return preRender;
};
