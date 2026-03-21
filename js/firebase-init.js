// ==========================================
// js/firebase-init.js - Centralized Firebase Config
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCKiWTmdkeN0Zs0shJIoYpMAXmTiM5P4po",
    authDomain: "xplainer-guru.firebaseapp.com",
    projectId: "xplainer-guru",
    storageBucket: "xplainer-guru.firebasestorage.app",
    messagingSenderId: "227641150227",
    appId: "1:227641150227:web:b3105514d96a880c20a8e6"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }

window.db = firebase.firestore(); // Using window.db to prevent 'const' redeclaration conflicts across files
db.settings({ experimentalForceLongPolling: true, experimentalAutoDetectLongPolling: false, merge: true });