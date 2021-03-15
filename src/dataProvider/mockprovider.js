function fetchhMockData(path) {
	return fetch(path + 'mockData.json', {
		headers : { 
		  'Content-Type': 'application/json',
		  'Accept': 'application/json'
		 }
	}).then(response => {
		return response.json();
	});
}

function getDestinations() {
    return fetchhMockData('').then(data => {
        return data.destinations;
    })
}

function getRegions() {
    return fetchhMockData('').then(data => {
        return data.regions;
    })
}

function getDestinationDetailsFromPath(year, title) {
    return fetchhMockData('../../').then(data => {
        return data.destination.head;
    })
}

function getDestinationImagesFromPath(year, title) {
    return fetchhMockData('../../').then(data => {
        return data.destination.images;
    })
}

const mockProvider = {
    getDestinations: getDestinations,
    getRegions: getRegions,
    getDestinationDetailsFromPath: getDestinationDetailsFromPath,
    getDestinationImagesFromPath: getDestinationImagesFromPath
};

export default mockProvider;


