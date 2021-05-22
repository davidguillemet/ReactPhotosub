import {
    TRANSIENT_PROPERTY_DB_INDEX,
    deleteTransientProperties,
    setDbIndex,
    getDbIndex,
} from './common';

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
const _simulations = [];

function getUserData() {
    return Promise.resolve({
        favorites: _favorites,
        simulations: _simulations
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

function addSimulationIndex(simulations) {
    simulations.forEach((simulation, index) => {
        setDbIndex(simulation, index);
    });
    return simulations;
}

function getSimulations() {
    return Promise.resolve(addSimulationIndex(_simulations));
}

function addSimulation(newSimulation) {
    deleteTransientProperties(newSimulation);
    _simulations.push(newSimulation);
    return Promise.resolve(addSimulationIndex(_simulations));
}

function updateSimulation(simulation) {
    // Delete transient properties but keep dbindex
    deleteTransientProperties(simulation, [TRANSIENT_PROPERTY_DB_INDEX]);
    if (getDbIndex(simulation) === undefined) {
        throw new Error("The simulation to update must contains an index")
    }
    _simulations.splice(getDbIndex(simulation), 1, simulation);
    return Promise.resolve(addSimulationIndex(_simulations));
}

function removeSimulation(simulationToRemove) {
    _simulations.splice(getDbIndex(simulationToRemove), 1);
    return Promise.resolve(addSimulationIndex(_simulations));
}

function getImageCount() {
    return Promise.resolve(86);
}

function getInteriors() {
    return _getBucketContent('interiors');
}

function getUploadedInteriors() {
    return fetchhMockData('../../').then(data => {
        return data.uploadedInteriors;
    });
}

function removeUploadedInterior(fileName) {
    return fetchhMockData('../../').then(data => {
        return data.uploadedInteriors.filter(interior => interior.endsWith(fileName) === false);
    });
}

function getImageDefaultSelection() {
    return _getBucketContent('homeslideshow');
}

function _getBucketContent(folder) {
    return fetchhMockData('../../').then(data => {
        return data[folder];
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
    getSimulations: getSimulations,
    addSimulation: addSimulation,
    updateSimulation: updateSimulation,
    removeSimulation: removeSimulation,
    getImageCount: getImageCount,
    getInteriors: getInteriors,
    getUploadedInteriors: getUploadedInteriors,
    removeUploadedInterior: removeUploadedInterior,
    getImageDefaultSelection: getImageDefaultSelection
};

export default mockProvider;


