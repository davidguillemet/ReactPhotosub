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

export function getDestinations() {
    return axios.get("/api/destinations")
    .then(response => {
        return response.data;
    });
}

export function getRegions() {
    return axios.get("/api/regions")
    .then(response => {
        return response.data;
    });
}

export function getDestinationDetailsFromPath(year, title) {
    return getDestinationProps(year, title, "head");
}

export function getDestinationImagesFromPath(year, title) {
    return getDestinationProps(year, title, "images");
}

export function getUserData(uid) {
    return axios.get(`/api/userdata/${uid}`)
    .then(response => {
        return response.data;
    });
}


const dataProvider = {
    getDestinations: getDestinations,
    getRegions: getRegions,
    getDestinationDetailsFromPath: getDestinationDetailsFromPath,
    getDestinationImagesFromPath: getDestinationImagesFromPath,
    getUserData: getUserData
}

export default dataProvider;