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
                if (user.emailVerified && localStorage.getItem(`pending_reg_${user.uid}`)) {
                    await finalizeRegistration(user);
                }

                const response = await fetch(`${BASE_URL}/auth/profile?uid=${user.uid}`);
                let userData = null;
                
                if (response.ok) {
                    userData = await response.json();
                }

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

    const allowedPublicRoles = ['student', 'parent', 'student_writer'];
    const isPublicUser = allowedPublicRoles.includes(role);

    let hasValidTestPass = false;
    if (userData.testPassExpiry) {
        const expiryTime = typeof userData.testPassExpiry.toMillis === 'function' ? userData.testPassExpiry.toMillis() : userData.testPassExpiry;
        if (Date.now() < expiryTime) hasValidTestPass = true;
    }

    if (!isPublicUser && !hasValidTestPass) {
        alert("⚠️ Access Denied: Staff members must use the Workspace Portal.");
        await auth.signOut();
        window.location.href = "login.html";
        return;
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
        
        if (!userCred.user.emailVerified) {
            await auth.signOut();
            return errorCallback("Access Denied! Please verify your email first. Check your inbox or spam folder.");
        }

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
    let { role, name, email, pass, phone, age, reason, childId } = data;
    role = role.toLowerCase().replace(/\s+/g, '_'); // Normalize "Student Writer" to "student_writer"
    
    const emailDomain = email.split('@')[1];
    if (blockedDomains.includes(emailDomain)) return errorCallback("Temporary email addresses are not allowed.");

    // Role-Specific Validation
    if (role === 'parent' && !childId) {
        return errorCallback("Parent accounts require a valid Student ID.");
    }
    
    const minAge = (role === 'parent') ? 18 : 15;
    if (parseInt(age) < minAge) {
        return errorCallback(`Minimum age for this role is ${minAge}.`);
    }

    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, pass);
        await userCred.user.updateProfile({ displayName: name });
        await userCred.user.sendEmailVerification();

        // Fix: Include all metadata in the persistence object
        const pendingData = {
            uid: userCred.user.uid, 
            name, email, role, phone, age,
            reason: reason || "",
            childId: childId || null,
            legalAgreementAccepted: Boolean(data.legalAgreementAccepted)
        };
        localStorage.setItem(`pending_reg_${userCred.user.uid}`, JSON.stringify(pendingData));

        successCallback(userCred.user, email, "verification_sent");
    } catch (error) { 
        errorCallback(error.code === 'auth/email-already-in-use' ? "Email is already registered! Please Login." : error.message); 
    }
}

// 6. FINALIZE REGISTRATION (Called when they first login after clicking email link)
async function finalizeRegistration(user) {
    const cacheKey = `pending_reg_${user.uid}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) return;

    try {
        const data = JSON.parse(cachedData);
        const payload = {
            uid: user.uid, 
            name: data.name, email: data.email, 
            role: data.role, phone: data.phone, 
            age: data.age, reason: data.reason,
            childId: data.childId,
            legalAgreementAccepted: data.legalAgreementAccepted 
        };

        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });

        if (response.ok) localStorage.removeItem(cacheKey);
    } catch (err) { console.error("Backend Registration Sync Failed:", err); }
}

// 7. GOOGLE AUTH LOGIN/SIGNUP LOGIC
window.triggerGoogleAuth = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;

        // Check if user exists in our Firestore
        const docRef = await db.collection("users").doc(user.uid).get();

        if (!docRef.exists) {
            // Capture intended role from UI if available, else default to student
            const selectedRole = (document.getElementById('role-select')?.value || 'student').toLowerCase().replace(/\s+/g, '_');

            await db.collection("users").doc(user.uid).set({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                pic: user.photoURL,
                role: selectedRole, 
                accountStatus: "active",
                joined: firebase.firestore.FieldValue.serverTimestamp()
            });
            // Redirect to dashboard immediately since Google emails are pre-verified
            const redirectUrl = localStorage.getItem("redirectAfterLogin") || "dashboard.html";
            localStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectUrl;
        } else {
            // Existing user -> Sync and enforce routing
            const userData = docRef.data();
            await enforceRouting(user, userData, (err) => alert(err));
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        alert("Failed to sign in with Google. " + error.message);
    }
};

window.authManager = { auth, initializeAuthListener, handleLogout, processLogin, processSignup, enforceRouting };