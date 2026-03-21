// ==========================================
// 🚀 XPLAINER GURU: BACKGROUND PUSH NOTIFICATION ENGINE
// File Name MUST BE: firebase-messaging-sw.js
// ==========================================

importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Wahi same Firebase Config jo aapki baki files mein hai
const firebaseConfig = {
    apiKey: "AIzaSyCKiWTmdkeN0Zs0shJIoYpMAXmTiM5P4po",
    authDomain: "xplainer-guru.firebaseapp.com",
    projectId: "xplainer-guru",
    storageBucket: "xplainer-guru.firebasestorage.app",
    messagingSenderId: "227641150227",
    appId: "1:227641150227:web:b3105514d96a880c20a8e6"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

// Jab website background mein ho (band ho), tab message aaye toh kya dikhana hai
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification.title || 'Xplainer Guru Update';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png', // Apni logo file ka path daalein
        badge: '/logo.png',
        data: { url: payload.data?.click_action || '/' } // Click karne par kahan bhejna hai
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click notification event
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});