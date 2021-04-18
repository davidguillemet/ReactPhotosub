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

const _favorites = new Set();

function getUserData() {
    return Promise.resolve({
        favorites: _favorites
    });
}

function addFavorite(path) {
    _favorites.add(path);
    return Promise.resolve(Array.from(_favorites));
}

function removeFavorite(path) {
    _favorites.delete(path);
    return Promise.resolve(Array.from(_favorites));
}

function getFavorites() {
    return fetchhMockData('../../').then(data => {
        return data.destination.images.filter(image => _favorites.has(`${image.path}/${image.name}`));
    });
}

function getImageCount() {
    return Promise.resolve(86);
}

function getInteriors() {
    return fetchhMockData('../../').then(data => {
        return data.interiors;
    });
}

const mockProvider = {
    getDestinations: getDestinations,
    getRegions: getRegions,
    getDestinationDetailsFromPath: getDestinationDetailsFromPath,
    getDestinationImagesFromPath: getDestinationImagesFromPath,
    getUserData: getUserData,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
    getFavorites: getFavorites,
    getImageCount: getImageCount,
    getInteriors: getInteriors
};

export default mockProvider;


