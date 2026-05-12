// ==========================================
// js/auth.js - PUBLIC APP: AUTHENTICATION & ROUTING
// ==========================================

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
window.BASE_URL = 'https://xplainerguru-backend.onrender.com';

const blockedDomains = ['tempmail.com', '10minutemail.com', 'yopmail.com', 'guerrillamail.com', 'mailinator.com', 'temp-mail.org', 'sharklasers.com', 'dispostable.com', 'tempmail.plus', 'nada.email'];

// 1. AUTH STATE LISTENER
function initializeAuthListener(onUserLoaded, onUserUnauthenticated) {
    if (!auth) return;
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Check Scribes collection first, then Users to support Admin backend sync
                let userDoc = await db.collection("scribes").doc(user.uid).get();
                if (!userDoc.exists) {
                    userDoc = await db.collection("users").doc(user.uid).get();
                }
                const userData = userDoc.exists ? userDoc.data() : null;
                
                try {
                    if (onUserLoaded) onUserLoaded(user, userData);
                } catch (uiError) {
                    console.error("Critical: Auth Listener callback failed:", uiError);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (onUserLoaded) onUserLoaded(user, null, error);
            }
        } else {
            if (onUserUnauthenticated) onUserUnauthenticated();
        }
    });
}

// 2. LOGOUT LOGIC
function handleLogout(redirectUrl = "login.html") {
    if (auth) {
        auth.signOut().then(() => {
            window.location.href = redirectUrl;
        }).catch((error) => console.error("Logout Error:", error));
    }
}

// 3. STRICT ROUTING ENGINE
async function enforceRouting(user, userData, errorCallback) {
    if (!user || !userData) return;

    const role = (userData.role || 'student').toLowerCase();
    const status = (userData.accountStatus || userData.status || 'active').toLowerCase();

    const staffRoles = ['mentor', 'support', 'admin', 'founder'];
    const isStaff = staffRoles.includes(role);

    // Gatekeeping: Staff members are blocked from public student dashboards
    if (isStaff) {
        alert("⚠️ Access Denied: Staff members must use the Workspace Portal (xg-workspace).");
        window.location.href = "https://xg-workspace.netlify.app"; // Redirect to internal portal
        return;
    }

    let hasValidTestPass = false;
    if (userData.testPassExpiry) {
        const expiryTime = typeof userData.testPassExpiry.toMillis === 'function' ? userData.testPassExpiry.toMillis() : userData.testPassExpiry;
        if (Date.now() < expiryTime) hasValidTestPass = true;
    }
    
    if (status !== 'active') {
        alert("Access Denied: Your account is pending review or suspended.");
        await auth.signOut();
        window.location.href = "login.html";
        return;
    }

    // Check if there's a stored redirect (e.g., from clicking "Take Test")
    const redirectUrl = localStorage.getItem("redirectAfterLogin") || "dashboard.html";
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirectUrl;
}

// 4. LOGIN LOGIC (Email/Password)
async function processLogin(email, password, portalType, options = {}, errorCallback) {
    try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        
        // Removed emailVerified check to allow direct login
        
        const syncResponse = await fetch(`${BASE_URL}/auth/login-sync`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: userCred.user.uid })
        });

        if (!syncResponse.ok) {
            const errData = await syncResponse.json();
            await auth.signOut();
            return errorCallback(errData.message || "Session synchronization failed.");
        }

        const userData = await syncResponse.json();
        await enforceRouting(userCred.user, userData, errorCallback);

    } catch (error) {
        errorCallback(error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? "Invalid email or password." : error.message);
    }
}

// 5. SIGNUP LOGIC
async function processSignup(data, successCallback, errorCallback) {
    let { role, name, email, pass, phone, dob, reason, childId } = data;
    role = role.toLowerCase().replace(/\s+/g, '_'); 
    
    // Safety check to prevent "includes of undefined" error
    if (!email || email.indexOf('@') === -1) {
        return errorCallback("Invalid email address format.");
    }
    
    const emailDomain = email?.split('@')[1];
    if (emailDomain && blockedDomains.includes(emailDomain.toLowerCase())) {
        return errorCallback("Temporary email addresses are not allowed.");
    }

    // Role-Specific Validation
    if (role === 'parent' && !childId) {
        return errorCallback("Parent accounts require a valid Student ID.");
    }

    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, pass);
        await userCred.user.updateProfile({ displayName: name });
        // Removed sendEmailVerification to allow direct login creation

        // Fix: Save to 'scribes' if role is student_writer, else 'users'
        const collectionName = role === 'student_writer' ? 'scribes' : 'users';
        await db.collection(collectionName).doc(userCred.user.uid).set({
            uid: userCred.user.uid,
            name: name,
            email: email,
            role: role,
            phone: phone || "",
            dob: dob || "", // Use dob instead of age
            reason: reason || "",
            childId: childId || null,
            accountStatus: "active",
            joined: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Trigger Automatic Welcome Email (Non-blocking)
        fetch("https://script.google.com/macros/s/AKfycbyvnS3Ie78b1FiCXntWoT5buqruMY5I71K-r0wo8sH1xVbcSN6Mhj_4TFq5j8BWA4hI/exec", {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            keepalive: true,
            body: JSON.stringify({ action: "signup_user", name: name, email: email, role: role })
        }).catch(e => console.log("Silent Email Alert Error", e));

        // Determine WhatsApp Links based on role
        const waChannel = (typeof CONFIG !== 'undefined') ? CONFIG.waChannel : '';
        const waLinks = waChannel ? [waChannel] : []; 
        if (role === 'student_writer' && typeof CONFIG !== 'undefined' && CONFIG.waScribeGroup) {
            waLinks.push(CONFIG.waScribeGroup);
        }

        successCallback({
            user: userCred.user,
            email: email,
            waLinks: waLinks,
            type: "direct_login"
        });
    } catch (error) { 
        errorCallback(error.code === 'auth/email-already-in-use' ? "Email is already registered! Please Login." : error.message); 
    }
}

// 6. GOOGLE AUTH LOGIN/SIGNUP LOGIC
window.triggerGoogleAuth = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // 1. Check if user exists in scribes collection (Prevent role overwrite)
        const scribeDoc = await db.collection("scribes").doc(user.uid).get();
        if (scribeDoc.exists) {
            await enforceRouting(user, scribeDoc.data(), (err) => alert(err));
            return;
        }

        // 2. Check if user exists in users collection (Prevent role overwrite)
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (userDoc.exists) {
            await enforceRouting(user, userDoc.data(), (err) => alert(err));
            return;
        }

        // 3. New User -> ONLY THEN create in users collection with role: 'student'
        const userData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                pic: user.photoURL,
            role: 'student', 
                accountStatus: "active",
                joined: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection("users").doc(user.uid).set(userData);
        
        // Trigger Automatic Welcome Email (Non-blocking)
        fetch("https://script.google.com/macros/s/AKfycbyvnS3Ie78b1FiCXntWoT5buqruMY5I71K-r0wo8sH1xVbcSN6Mhj_4TFq5j8BWA4hI/exec", {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            keepalive: true,
            body: JSON.stringify({ action: "signup_user", name: user.displayName, email: user.email, role: 'student' })
        }).catch(e => console.log("Silent Email Alert Error", e));

        const redirectUrl = localStorage.getItem("redirectAfterLogin") || "dashboard.html";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectUrl;

    } catch (error) {
        console.error("Google Auth Error:", error);
        alert("Failed to sign in with Google. " + error.message);
    }
};

window.authManager = { auth, initializeAuthListener, handleLogout, processLogin, processSignup, enforceRouting };