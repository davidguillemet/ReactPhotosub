import axios from 'axios';
import { firebaseAuth } from '../components/firebase';

import {
    TRANSIENT_PROPERTY_DB_INDEX,
    deleteTransientProperties,
    setDbIndex,
    getDbIndex,
    API_PREFIX
} from './common';

// Add a request interceptor
axios.interceptors.request.use(async function (config) {
    if (firebaseAuth().currentUser) {
        const token = await firebaseAuth().currentUser.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function _getApiUri(apiName) {
    return API_PREFIX + apiName;
}

function getDestinationProps(year, title, props) {
    return axios.get(_getApiUri(`/api/destination/${year}/${title}/${props}`))
    .then(response => {
        return response.data;
    })
}

function getDestinations() {
    return axios.get(_getApiUri("/api/destinations"))
    .then(response => {
        return response.data;
    });
}

function getRegions() {
    return axios.get(_getApiUri("/api/regions"))
    .then(response => {
        return response.data;
    });
}

function getLocations() {
    return axios.get(_getApiUri("/api/locations"))
    .then(response => {
        return response.data;
    });
}

function getDestinationDetailsFromPath(year, title) {
    return getDestinationProps(year, title, "head");
}

function getDestinationImagesFromPath(year, title) {
    return getDestinationProps(year, title, "images");
}

function getUserData(uid) {
    return axios.get(_getApiUri(`/api/userdata/${uid}`))
    .then(response => {
        return response.data;
    });
}

function addFavorite(path) {
    return axios.post(_getApiUri('/api/favorites'), { path: path })
    .then(response => {
        return response.data;
    });
}

function removeFavorite(path) {
    return axios.delete(_getApiUri('/api/favorites'), {data: { path: path } } )
    .then(response => {
        return response.data;
    });
}

function getFavorites() {
    return axios.get(_getApiUri('/api/favorites'))
    .then(response => {
        return response.data;
    })
}

function _addSimulationDbIndex(simulations) {
    simulations.forEach((simulation, index) => {
        setDbIndex(simulation, index);
    });
    return simulations;
}

function getSimulations() {
    return axios.get(_getApiUri('/api/simulations'))
    .then(response => {
        // we generate an index property that corresponds to the index in the db json array
        // this index we allow to identify any simulation for deletion or update
        return _addSimulationDbIndex(response.data.simulations);
    });
}

function addSimulation(newSimulation) {
    deleteTransientProperties(newSimulation);
    return axios.post(_getApiUri('/api/simulations'), newSimulation)
    .then(response => {
        return _addSimulationDbIndex(response.data);
    });
}

function updateSimulation(simulation) {
    // Delete transient properties but keep dbindex
    deleteTransientProperties(simulation, [TRANSIENT_PROPERTY_DB_INDEX]);
    // Here, simulation should contain an index property
    return axios.post(_getApiUri('/api/simulations'), simulation)
    .then(response => {
        return _addSimulationDbIndex(response.data);
    });
}

function removeSimulation(simulation) {
    return axios.delete(_getApiUri('/api/simulations'), {data: { index: getDbIndex(simulation) } })
    .then(response => {
        return _addSimulationDbIndex(response.data);
    });
}

function getImageCount() {
    return axios.get(_getApiUri('/api/images'))
    .then(response => {
        return response.data.count;
    })
}

function getInteriors() {
    return _getBucketContent('interiors');
}

function getUploadedInteriors() {
    return axios.get(_getApiUri('/api/uploadedInteriors'))
    .then(response => {
        return response.data;
    });
}

function removeUploadedInterior(fileName) {
    return axios.delete(_getApiUri('/api/uploadedInteriors'), {data: { fileName: fileName } })
}

function getImageDefaultSelection() {
    return _getBucketContent('homeslideshow');
}

function _getBucketContent(folder) {
    return axios.get(_getApiUri(`/api/bucket/${folder}`))
    .then(response => {
        return response.data;
    });
}

function waitForThumbnails(fileName) {
    return axios.get(_getApiUri(`/api/thumbstatus/${fileName}`));
}

function searchImages(pageIndex, query, pageSize, exact, processId) {
    return axios.post(_getApiUri('/api/search'), {
        query: query,
        page: pageIndex,
        pageSize: pageSize,
        exact: exact,
        processId: processId
    }).then(response => {
        return response.data;
    })
}

function sendMessage(messageProperties) {
    return axios.post(_getApiUri('/api/message'), {
        ...messageProperties
    }).then(response => {
        return response.data;
    })
}

const dataProvider = {
    getDestinations: getDestinations,
    getRegions: getRegions,
    getLocations: getLocations,
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
    getImageDefaultSelection: getImageDefaultSelection,
    waitForThumbnails: waitForThumbnails,
    searchImages: searchImages,
    sendMessage: sendMessage
}

export default dataProvider;