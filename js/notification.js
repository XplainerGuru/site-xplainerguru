// ==========================================
// js/notification.js - PUBLIC Notification Module
// ==========================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7HnmqV789rjclioBMa2kwNELRkrMqEcH21e3pzyqosok6Q371TNW4aiVLBb4rE0Zk/exec";

window.notificationManager = {
    initializeNotifications: function(role, uid) {
        this.requestPushPermission(uid);
    },

    initGlobalPush: function() {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            const promptModal = document.getElementById('push-soft-prompt');
            if (promptModal) promptModal.style.display = 'flex';
        }
    },

    requestPushPermission: async function(uid = null) {
        if (typeof firebase === 'undefined' || !firebase.messaging || !firebase.messaging.isSupported()) return;
        
        try {
            const permission = Notification.permission;
            if (permission === 'granted') {
                await this.registerToken(uid);
            } else if (permission === 'default') {
                const promptModal = document.getElementById('push-soft-prompt');
                if (promptModal) promptModal.style.display = 'flex';
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
                const uid = window.authManager?.auth?.currentUser?.uid || null;
                await this.registerToken(uid);
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
                const user = window.authManager?.auth?.currentUser || null;
                await fetch(`${window.BASE_URL}/notifications/register-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user ? user.uid : null, fcmToken: token })
                });
            }
        } catch (e) { console.error("Error registering token", e); }
    },

    // Simplified Email Alert for Public App
    sendEmailAlert: async function(toEmail, subject, body, senderInfo) {
        let senderName = "Xplainer Guru System";
        
        if (senderInfo && senderInfo.name) {
            senderName = `${senderInfo.name} @ Xplainer Guru`;
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