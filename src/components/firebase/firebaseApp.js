import firebase from 'firebase';

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

const FirebaseApp = firebase;

export default FirebaseApp;
