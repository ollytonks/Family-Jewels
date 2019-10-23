import * as firebase from 'firebase';
import "firebase/auth";

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "family-jewels-8b7ef.firebaseapp.com",
    databaseURL: "https://family-jewels-8b7ef.firebaseio.com",
    projectId: "family-jewels-8b7ef",
    storageBucket: "family-jewels-8b7ef.appspot.com",
    messagingSenderId: "223646158537",
    appId: "1:223646158537:web:b032b7c5e8e32ce1"
};

const firebaseApp = firebase.initializeApp(config);

//handles authentication
const firebaseAuth = firebaseApp.auth();


export { firebase, firebaseAuth };
