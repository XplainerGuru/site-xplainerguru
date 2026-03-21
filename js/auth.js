// ==========================================
// js/auth.js - Authentication & Identity Module
// ==========================================

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
if (db) {
    db.settings({ 
        experimentalForceLongPolling: true, 
        experimentalAutoDetectLongPolling: false, 
        merge: true 
    });
}

// SPAM FILTER
const blockedDomains = ['tempmail.com', '10minutemail.com', 'yopmail.com', 'guerrillamail.com', 'mailinator.com', 'temp-mail.org', 'sharklasers.com', 'dispostable.com', 'tempmail.plus', 'nada.email'];

// 3. AUTH STATE LISTENER (Reusable Wrapper)
function initializeAuthListener(onUserLoaded, onUserUnauthenticated) {
    if (!auth) return;
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const docRef = db.collection("users").doc(user.uid);
                const docSnap = await docRef.get();
                let userData = docSnap.exists ? docSnap.data() : null;
                
                if (onUserLoaded) onUserLoaded(user, userData);
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (onUserLoaded) onUserLoaded(user, null, error);
            }
        } else {
            if (onUserUnauthenticated) onUserUnauthenticated();
        }
    });
}

// 4. LOGOUT LOGIC
function handleLogout(redirectUrl = "login.html") {
    if (auth) {
        auth.signOut().then(() => {
            window.location.href = redirectUrl;
        }).catch((error) => console.error("Logout Error:", error));
    }
}

// 5. LOGIN LOGIC
async function processLogin(email, password, successCallback, errorCallback) {
    try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        
        if (!userCred.user.emailVerified) {
            await auth.signOut();
            return errorCallback("Access Denied! Please verify your email first. Check your inbox or spam folder.");
        }

        let role = 'student'; // Fallback
        const doc = await db.collection("users").doc(userCred.user.uid).get();
        if (doc.exists) {
            const userData = doc.data();
            role = userData.role || 'student';
            if (userData.role === 'deleted' || userData.role === 'surrendered') {
                await auth.signOut();
                return errorCallback("Account Suspended", "suspended");
            }
            if (userData.role === 'pending_review') {
                await auth.signOut();
                return errorCallback("Application Under Review", "pending", userData);
            }
        }

        await db.collection("users").doc(userCred.user.uid).set({ 
            lastLogin: new Date().toISOString(),
            legalAgreementSigned: true
        }, { merge: true });
        
        // --- UPDATED ROUTING LOGIC WITH NEW URLS ---
        const publicRoles = ['student', 'parent', 'student_writer'];
        const teamRoles = ['writer', 'mentor_jr', 'mentor_sr', 'support_jr', 'support_sr'];
        const adminRoles = ['admin_academic', 'admin_support', 'admin_global'];

        if (publicRoles.includes(role)) {
            window.location.href = 'dashboard.html'; // Changed from portal.html
        } else if (teamRoles.includes(role)) {
            window.location.href = 'workspace.html'; // Keep as workspace
        } else if (adminRoles.includes(role)) {
            window.location.href = 'admin.html'; // Changed from console.html
        } else if (role === 'founder') {
            window.location.href = 'founder.html'; // Changed from hq.html
        } else {
            console.error("Role missing or unauthorized.");
            // Optional fallback: window.location.href = 'index.html';
        }
    } catch (error) {
        errorCallback(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? "Invalid email or password." : error.message);
    }
}

// 6. SIGNUP LOGIC
async function processSignup(data, successCallback, errorCallback) {
    const { role, name, email, pass, phone, age, reason, childId } = data;

    // Spam Check
    const emailDomain = email.split('@')[1];
    if (blockedDomains.includes(emailDomain)) {
        return errorCallback("Temporary email addresses are not allowed.");
    }

    // Legal Enforcement Check for Team Members
    if (['mentor', 'writer', 'support'].includes(role)) {
        if (!data.legalAgreementAccepted) {
            return errorCallback("You must accept the Legal & Offboarding Agreement to proceed.");
        }
    }

    try {
        // Parent Child ID Verification
        if (role === 'parent') {
            const childSnap = await db.collection("users").where("uid", "==", childId).get();
            if (childSnap.empty) return errorCallback("Error: The provided Student ID does not exist in our system. Please verify and try again.");
        }

        const userCred = await auth.createUserWithEmailAndPassword(email, pass);
        await userCred.user.updateProfile({ displayName: name });
        await userCred.user.sendEmailVerification();

        let finalRole = role === 'student' ? 'student' : 'pending_review';
        let generatedToken = role !== 'student' ? "XG-REQ-" + Math.random().toString(36).substr(2, 6).toUpperCase() : null;

        await db.collection("users").doc(userCred.user.uid).set({
            uid: userCred.user.uid, name: name, email: email,
            whatsapp: phone || "N/A", age: age ? parseInt(age) : "N/A",
            linkedChildId: childId || null, role: finalRole, requestedRole: role !== 'student' ? role : null,
            requestReason: reason || null, requestToken: generatedToken,
            publicProfile: false, joined: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(), accountStatus: "Active",
            ...(role !== 'student' && role !== 'parent' ? {
                legalAgreementSigned: true,
                publicVisibilityConsent: false,
                founderVisibilityOverride: false
            } : {})
        });

        // Auto-Ticket routing
        if (role !== 'student') {
            let ticketQuery = role === 'parent' ? `Child ID Provided: ${childId} \nPhone: ${phone}` : `Age: ${age} \nPhone: ${phone} \nBackground/Reason: ${reason}`;
            await db.collection("support_tickets").add({
                ticketId: generatedToken, uid: userCred.user.uid, name: name, email: email,
                subject: `New Application | Role: ${role.toUpperCase()}`, query: ticketQuery, status: 'Open', routeTo: 'AdminEscalation', timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        successCallback(userCred.user, email, generatedToken);
    } catch (error) { errorCallback(error.code === 'auth/email-already-in-use' ? "Email is already registered! Please Login." : "Signup failed: " + error.message); }
}

// 7. EXPOSE GLOBALLY FOR DOM HOOKS
window.authManager = { auth, db, initializeAuthListener, handleLogout, processLogin, processSignup };