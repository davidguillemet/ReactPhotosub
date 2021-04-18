import axios from 'axios';
import { FirebaseApp } from '../components/firebase';

// Add a request interceptor
axios.interceptors.request.use(async function (config) {
    if (FirebaseApp.auth().currentUser) {
        const token = await FirebaseApp.auth().currentUser.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function getDestinationProps(year, title, props) {
    return axios.get(`/api/destination/${year}/${title}/${props}`)
    .then(response => {
        return response.data;
    })
}

function getDestinations() {
    return axios.get("/api/destinations")
    .then(response => {
        return response.data;
    });
}

function getRegions() {
    return axios.get("/api/regions")
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
    return axios.get(`/api/userdata/${uid}`)
    .then(response => {
        return response.data;
    });
}

function addFavorite(path) {
    return axios.post('/api/favorites', { path: path })
    .then(response => {
        return response.data;
    });
}

function removeFavorite(path) {
    return axios.delete('/api/favorites', {data: { path: path } } )
    .then(response => {
        return response.data;
    });
}

function getFavorites() {
    return axios.get('/api/favorites')
    .then(response => {
        return response.data;
    })
}

function getImageCount() {
    return axios.get('/api/images')
    .then(response => {
        return response.data;
    })
}

function getInteriors() {
    return axios.get('/Api/interiors')
    .then(response => {
        return response.data;
    });
}

const dataProvider = {
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
}

export default dataProvider;