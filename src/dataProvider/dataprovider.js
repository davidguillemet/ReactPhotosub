
function getDestinationProps(year, title, props) {
    return fetch(`/api/destination/${year}/${title}/${props}`)
    .then(data => {
        return data.json();
    });
}

export function getDestinations() {
    return fetch("/api/destinations")
    .then(data => {
        return data.json();
    });
}

export function getRegions() {
    return fetch("/api/regions")
    .then(data => {
        return data.json();
    });
}

export function getDestinationDetailsFromPath(year, title) {
    return getDestinationProps(year, title, "head");
}

export function getDestinationImagesFromPath(year, title) {
    return getDestinationProps(year, title, "images");
}


const dataProvider = {
    getDestinations: getDestinations,
    getRegions: getRegions,
    getDestinationDetailsFromPath: getDestinationDetailsFromPath,
    getDestinationImagesFromPath: getDestinationImagesFromPath
}

export default dataProvider;