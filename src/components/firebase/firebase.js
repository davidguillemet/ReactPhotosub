import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

const config = {
    apiKey: "AIzaSyALeWHQ-CKzvcG-sb7466UNzFDn_w5HQOc",
    authDomain: "photosub.firebaseapp.com",
    projectId: "photosub",
    storageBucket: "photosub.appspot.com",
    messagingSenderId: "780806748384",
    appId: "1:780806748384:web:c2976014be05cc21a13885",
    measurementId: "G-NNE3P3R7HH"
};

firebase.initializeApp(config);

export const firebaseAuth = firebase.auth;
export const firebaseStorage = firebase.storage;
export const firebaseDb = firebase.firestore;
