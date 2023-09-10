const functions = require("firebase-functions");
const express = require("express");
const preRender = require("prerender-node");
const fs = require("fs");

if (process.env.FUNCTIONS_EMULATOR === "true") {
    preRender.set("prerenderServiceUrl", "http://localhost:3000/");
} else {
    preRender.set("prerenderToken", process.env.PRERENDER_TOKEN);
}

const preRenderApp = express();
preRenderApp.use(preRender);

const _pageNamePlaceHolder = "{title}";
const _descriptionTemplate = `${_pageNamePlaceHolder} | David Guillemet - Underwater Photography`;
const _shortTitleTemplate = `${_pageNamePlaceHolder} | David Guillemet`;
const _defaultImage = "https://storage.googleapis.com/photosub.appspot.com/2017/rajaampat/thumbs/DSC_5683_m.jpg";

const _destinationRegexp = /\/destinations\/(?<year>[0-9]{4})\/(?<location>[a-z]+)/;

const _locationCaptions = {
    "ambon": "Ambon",
    "tulamben": "Tulamben",
    "dominica": "Dominica",
    "lapaz": "La Paz",
    "romblon": "Romblon",
    "anilao": "Anilao",
    "gili": "Gili Air",
    "sardinerun": "Sardine Run",
    "palau": "Palau",
    "teman": "Raja Ampat",
    "corepen": "Dampier Strait",
    "sudan": "Sudan",
    "mozambique": "Ponta Do Ouro",
    "umkomaas": "Aliwal Shoal",
    "rajaampat": "Raja Ampat",
    "maumere": "Maumere",
    "redsea": "Red Sea",
    "alor": "Alor",
    "saintes": "The Saints",
    "bahamas": "Bahamas",
    "dampier": "Dampier Strait",
    "misool": "Misool",
    "bandasea": "Banda Sea",
    "azores": "Azores",
};

const getPageTitle = (req) => {
    const path = req.path;
    if (path === "/destinations") {
        return "Destinations";
    }
    if (path.startsWith("/destinations")) {
        // /destinations/2020/romblon
        // -> "Romblon - 2020"
        const match = path.match(_destinationRegexp);
        const year = match.groups["year"];
        const location = match.groups["location"];
        const locCaption = _locationCaptions[location] || location;
        return `${locCaption} - ${year}`;
    }
    if (path === "/search") {
        return "Search";
    }
    if (path === "/finning") {
        return "Finning";
    }
    if (path === "/composition") {
        return "Composition";
    }
    if (path === "/about") {
        return "About";
    }
    if (path === "/contact") {
        return "Contact";
    }
    return "Home";
};

preRenderApp.get("*", (req, res) => {
    return fs.readFile("./web/index.html", "utf8", (err, htmlData) => {
        const pageName = getPageTitle(req);
        const title = _shortTitleTemplate.replace(_pageNamePlaceHolder, pageName);
        const description = _descriptionTemplate.replace(_pageNamePlaceHolder, pageName);
        htmlData = htmlData
            .replace(/__HTML_TITLE__/g, title)
            .replace(/__META_TITLE__/g, description)
            .replace(/__META_DESCRIPTION__/g, description)
            .replace(/__META_IMAGE__/g, _defaultImage);
        return res.send(htmlData);
    });
});

exports.preRender = functions
    .runWith({secrets: [
        "PRERENDER_TOKEN",
    ]})
    .https.onRequest(preRenderApp);
