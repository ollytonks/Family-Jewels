import * as firebase from 'firebase';

const settings = {timestampsInSnapshots: true};

const config = {
    apiKey: "AIzaSyCBvZdocIgvv1jBTUHi1XuDK86ZL2yvxzk",
    authDomain: "family-jewels-8b7ef.firebaseapp.com",
    databaseURL: "https://family-jewels-8b7ef.firebaseio.com",
    projectId: "family-jewels-8b7ef",
    storageBucket: "family-jewels-8b7ef.appspot.com",
    messagingSenderId: "223646158537",
    appId: "1:223646158537:web:b032b7c5e8e32ce1"
};

firebase.initializeApp(config);

firebase.firestore().settings(settings);

export default firebase;
