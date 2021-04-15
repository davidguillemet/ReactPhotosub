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

function getUserData() {
    return Promise.resolve({
        uid: 'fakeuid',
        favorites: [
            "2014/misool/DSC_1622.jpg",
            "2014/misool/DSC_1633.jpg"
        ]
    });
}

const mockProvider = {
    getDestinations: getDestinations,
    getRegions: getRegions,
    getDestinationDetailsFromPath: getDestinationDetailsFromPath,
    getDestinationImagesFromPath: getDestinationImagesFromPath,
    getUserData: getUserData
};

export default mockProvider;


