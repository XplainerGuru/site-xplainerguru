// ==========================================
// js/notification.js - Notification & FCM Module
// ==========================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7HnmqV789rjclioBMa2kwNELRkrMqEcH21e3pzyqosok6Q371TNW4aiVLBb4rE0Zk/exec";

window.notificationManager = {
    initializeNotifications: function(role, uid) {
        console.log('Notifications ready for role:', role, '| UID:', uid);
        this.requestPushPermission(uid);
    },

    initGlobalPush: function() {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            const promptModal = document.getElementById('push-soft-prompt');
            if (promptModal) promptModal.style.display = 'flex';
        }
    },

    requestPushPermission: async function(uid = null) {
        if (typeof firebase === 'undefined' || !firebase.messaging || !firebase.messaging.isSupported()) {
            console.log("FCM is not supported in this browser/environment.");
            return;
        }
        
        try {
            const permission = Notification.permission;
            if (permission === 'granted') {
                await this.registerToken(uid);
            } else if (permission === 'default') {
                const promptModal = document.getElementById('push-soft-prompt');
                if (promptModal) promptModal.style.display = 'flex';
            } else {
                console.log("User has blocked notifications natively.");
            }
        } catch (error) {
            console.error("Error setting up push notifications:", error);
        }
    },

    triggerNativePushPrompt: async function() {
        document.getElementById('push-soft-prompt').style.display = 'none';
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const uid = window.authManager && window.authManager.auth && window.authManager.auth.currentUser ? window.authManager.auth.currentUser.uid : null;
                await this.registerToken(uid);
            } else {
                console.warn("Push notification permission denied by user.");
            }
        } catch (error) {
            console.error("Native prompt error:", error);
        }
    },

    registerToken: async function(uid) {
        try {
            const messaging = firebase.messaging();
            const token = await messaging.getToken();
            if (token) {
                const db = window.authManager ? window.authManager.db : firebase.firestore();
                const user = window.authManager && window.authManager.auth ? window.authManager.auth.currentUser : null;
                
                if (user) {
                    await db.collection('users').doc(user.uid).update({ fcmTokens: firebase.firestore.FieldValue.arrayUnion(token) });
                    console.log("FCM Push Token registered successfully for User.");
                } else {
                    await db.collection('public_subscribers').doc(token).set({ token: token, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
                    console.log("FCM Push Token registered successfully for Public Subscriber.");
                }
            }
        } catch (e) { console.error("Error registering token", e); }
    },

    sendPushAlert: async function(targetAudience, title, body) {
        console.log('Push sent to:', targetAudience, '| Title:', title);
    },

    sendManualBroadcast: async function(targetAudience, title, body, specificDept = null) {
        const db = window.authManager ? window.authManager.db : firebase.firestore();
        let targetTokens = [];
        let targetUids = [];

        try {
            if (targetAudience === 'everyone') {
                const usersSnap = await db.collection('users').get();
                usersSnap.forEach(doc => {
                    const data = doc.data();
                    targetUids.push(doc.id);
                    if (data.fcmTokens && Array.isArray(data.fcmTokens)) targetTokens.push(...data.fcmTokens);
                });
                const pubSnap = await db.collection('public_subscribers').get();
                pubSnap.forEach(doc => {
                    const data = doc.data();
                    if (data.token) targetTokens.push(data.token);
                });
            } else if (targetAudience === 'students') {
                const stuSnap = await db.collection('users').where('role', '==', 'student').get();
                stuSnap.forEach(doc => {
                    const data = doc.data();
                    targetUids.push(doc.id);
                    if (data.fcmTokens && Array.isArray(data.fcmTokens)) targetTokens.push(...data.fcmTokens);
                });
            } else if (targetAudience === 'department' && specificDept) {
                const deptSnap = await db.collection('users').where('department', '==', specificDept).get();
                deptSnap.forEach(doc => {
                    const data = doc.data();
                    targetUids.push(doc.id);
                    if (data.fcmTokens && Array.isArray(data.fcmTokens)) targetTokens.push(...data.fcmTokens);
                });
            }

            targetTokens = [...new Set(targetTokens)];
            targetUids = [...new Set(targetUids)];

            if (targetTokens.length === 0 && targetUids.length === 0) {
                alert("No active users found for this target.");
                return;
            }

            const currentUser = window.authManager && window.authManager.auth ? window.authManager.auth.currentUser : null;
            const senderName = currentUser ? currentUser.displayName : 'System Admin';

            // 1. WRITE TO FIRESTORE (IN-APP NOTIFICATIONS)
            const notificationPromises = targetUids.map(uid => 
                db.collection('users').doc(uid).collection('notifications').add({
                    title: title,
                    body: body,
                    timestamp: new Date().toISOString(),
                    read: false
                })
            );
            await Promise.all(notificationPromises);

            // 2. SEND FCM PUSH PAYLOAD
            if (targetTokens.length > 0) {
                const payload = { type: 'push_broadcast', tokens: targetTokens, title: title, body: body, senderName: senderName };
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST', 
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload)
                });
            }

            alert(`Broadcast sent! In-app notifications delivered to ${targetUids.length} users, and push notifications sent to ${targetTokens.length} devices.`);
            
            const modal = document.getElementById('broadcast-modal');
            if (modal) modal.style.display = 'none';
            
        } catch (error) {
            console.error("Broadcast Error:", error);
            alert("Failed to send broadcast.");
        }
    },

    sendEmailAlert: async function(toEmail, subject, body, senderInfo) {
        let senderName = "Xplainer Guru Notifications";
        
        if (senderInfo && senderInfo.role) {
            const roleLower = senderInfo.role.toLowerCase();
            const isFounder = roleLower === 'founder';
            const isAdmin = roleLower.startsWith('admin');
            const hasConsent = senderInfo.publicVisibilityConsent === true;
            const founderVeto = senderInfo.founderVisibilityOverride === true;

            if (isFounder || (isAdmin && hasConsent && !founderVeto)) {
                senderName = `${senderInfo.name} | ${senderInfo.role.toUpperCase()} @ Xplainer Guru`;
            } else {
                let displayRole = senderInfo.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                senderName = `${displayRole} @ Xplainer Guru`;
            }
        }

        const legalFooter = `<br><br><hr><small style="color: #666;">This is an automated no-reply email. Please do not reply directly to this address. For queries, contact our official support at: <a href="mailto:xplainerguru@gmail.com">xplainerguru@gmail.com</a></small>`;
        const finalBody = `${body}${legalFooter}`;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ to: toEmail, subject: subject, body: finalBody, senderName: senderName })
            });
            console.log("Email Webhook Triggered Successfully.");
        } catch (error) {
            console.error("Failed to trigger Email Webhook:", error);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.notificationManager) window.notificationManager.initGlobalPush();
    }, 2000);
});