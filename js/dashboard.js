// ==========================================
// js/dashboard.js - PUBLIC UI Routing & Dashboard Controller
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    if (window.authManager) {
        window.authManager.initializeAuthListener(handleUserLoaded, handleUserUnauthenticated);
    } else {
        console.error("Auth module not loaded! Ensure js/auth.js is included.");
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.authManager) window.authManager.handleLogout();
        });
    }

    const menuToggles = document.querySelectorAll('.menu-toggle');
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentLi = this.closest('.has-submenu');
            document.querySelectorAll('.has-submenu').forEach(item => {
                if (item !== parentLi) item.classList.remove('active');
            });
            if (parentLi) parentLi.classList.toggle('active');
        });
    });

    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    if (hamburgerBtn && sidebar) {
        let overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; 
        });
    }
});

function handleUserUnauthenticated() {
    window.location.href = "login.html";
}

function handleUserLoaded(user, userData, error) {
    if (error) {
        const loader = document.getElementById('loader');
        if (loader) loader.innerHTML = "<p style='color:#ef4444; font-family:Poppins;'>Error connecting to database.</p>";
        return;
    }

    let name = user.displayName || "Student";
    let email = user.email;
    let role = "student";
    let pic = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&bold=true`;

    if (userData) {
        name = userData.name || name;
        email = userData.email || email;
        role = userData.role ? userData.role.toLowerCase() : "student";
        if (userData.pic) pic = userData.pic;
    }
    
    const displayRole = role.toUpperCase();
    // Map role to prefix for Custom ID generation (Fix: Added SCR for Scribes)
    const rolePrefixMap = {
        'STUDENT': 'STU',
        'PARENT': 'PRN',
        'STUDENT_WRITER': 'SCR'
    };
    const prefix = rolePrefixMap[displayRole] || 'USR';
    let displayId = "XG-" + prefix + "-" + user.uid.substring(0,6).toUpperCase();

    window.dashboardManager = window.dashboardManager || {};
    window.dashboardManager.currentUserData = { uid: user.uid, name, email, role, displayId, pic };

    setElText('display-name', name);
    setElText('u-name', name);
    setElText('u-id', displayId);
    setElSrc('u-avatar', pic);
    
    setElText('p-name', name);
    setElText('p-email', email);
    setElText('p-role', role.toUpperCase().replace('_', ' '));
    setElSrc('p-img', pic);

    updatePortalTitle(role);
    routeDashboard(role);

    if (window.ticketingManager && typeof window.ticketingManager.initCategories === 'function') {
        window.ticketingManager.initCategories(role);
    }

    setElDisplay('loader', 'none');
    setElDisplay('dashboard-main-content', 'block');
    
    if (role === 'parent' && userData && userData.linkedChildId) {
        loadParentDashboard(userData.linkedChildId);
    }
    if (role === 'student' || role === 'student_writer') {
        loadStudentDashboardData(user.uid);
        fetchRecentPerformance(user.uid);
        fetchMyTickets(user.uid); // Tickets function called
    }

    if (window.notificationManager) {
        window.notificationManager.initializeNotifications(role, user.uid);
    }
    listenToNotifications(user.uid);
}

function setElText(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; }
function setElSrc(id, src) { const el = document.getElementById(id); if (el) el.src = src; }
function setElDisplay(id, display) { const el = document.getElementById(id); if (el) el.style.display = display; }

function updatePortalTitle(role) {
    const portalTitle = document.getElementById('portal-title');
    if (!portalTitle) return;
    if (role === 'parent') portalTitle.innerText = 'Parent Portal';
    else if (role === 'student_writer') portalTitle.innerText = 'Writer Portal (Scribe)';
    else portalTitle.innerText = 'Student Portal';
}

function hideAllViews() {
    const views = ['student-view', 'parent-view', 'writer-tools', 'creator-studio-widget', 'fallback-banner', 'help-desk-section', 'scribe-upgrade-card'];
    views.forEach(view => setElDisplay(view, 'none'));
}

function routeDashboard(role) {
    hideAllViews();
    
    if (role === 'student') {
        setElDisplay('student-view', 'block');
        setElDisplay('scribe-upgrade-card', 'flex'); // Ensure it's visible
        setElDisplay('help-desk-section', 'block'); 
    } 
    else if (role === 'parent') {
        setElDisplay('parent-view', 'block');
        setElDisplay('help-desk-section', 'block'); 
    } 
    else if (role === 'student_writer') {
        setElDisplay('student-view', 'block');
        setElDisplay('writer-tools', 'block'); 
        setElDisplay('creator-studio-widget', 'block');
        setElDisplay('help-desk-section', 'block');
    } 
    else {
        setElDisplay('student-view', 'block'); 
        setElDisplay('fallback-banner', 'flex');
    }
}

// ==========================================
// SCRIBE UPGRADE LOGIC (Fix: Added DOB)
// ==========================================
window.showScribeForm = function() {
    const modal = document.getElementById('scribe-application-modal');
    if(!modal) return;
    
    const userData = window.dashboardManager.currentUserData;
    document.getElementById('scribe-prefill-name').innerText = userData.name;
    document.getElementById('scribe-prefill-email').innerText = userData.email;
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

window.closeScribeForm = function() {
    const modal = document.getElementById('scribe-application-modal');
    if(modal) modal.style.display = 'none';
}

window.submitScribeUpgrade = async function() {
    const phone = document.getElementById('up-phone').value.trim();
    const dob = document.getElementById('up-dob') ? document.getElementById('up-dob').value : document.getElementById('up-age').value; // Supporting both ID formats
    const reason = document.getElementById('up-reason').value.trim();
    const btn = document.getElementById('upgrade-btn');
    
    if(!phone || !dob || !reason) return alert("Please fill all the fields!");
    if(!/^[6-9]\d{9}$/.test(phone)) return alert("Please enter a valid 10-digit Indian WhatsApp number.");
    
    btn.disabled = true;
    btn.innerHTML = "Upgrading...";
    
    try {
        const userData = window.dashboardManager.currentUserData;
        const db = firebase.firestore();
        
        // 1. Fetch user's current data from the users collection
        const userRef = db.collection("users").doc(userData.uid);
        let userSnap = await userRef.get();

        if (!userSnap.exists) {
            // Check if user is already migrated to scribes
            const scribeCheck = await db.collection("scribes").doc(userData.uid).get();
            if (scribeCheck.exists) {
                alert("Account already upgraded to Scribe!");
                window.location.reload();
                return;
            }
            throw new Error("User profile not found in users collection.");
        }

        const currentData = userSnap.data();

        // 2. Prepare migration object: Scribe details + role update
        const scribeData = {
            ...currentData,
            role: "student_writer",
            phone: phone,
            dob: dob,
            reason: reason,
            upgradedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 3. Save as new document in scribes collection
        await db.collection("scribes").doc(userData.uid).set(scribeData);

        // Trigger Scribe Welcome Email (Non-blocking)
        fetch("https://script.google.com/macros/s/AKfycbyvnS3Ie78b1FiCXntWoT5buqruMY5I71K-r0wo8sH1xVbcSN6Mhj_4TFq5j8BWA4hI/exec", {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            keepalive: true,
            body: JSON.stringify({ action: "signup_user", name: currentData.name, email: currentData.email, role: "student_writer" })
        }).catch(e => console.log("Silent Email Alert Error", e));

        // 4. Delete old document from users collection (ONLY on success)
        await userRef.delete();

        // Fix: Alert ki jagah modal ka content badal dein taaki link clickable ho
        const scribeLink = (typeof CONFIG !== 'undefined' && CONFIG.waScribeGroup) ? CONFIG.waScribeGroup : 'https://chat.whatsapp.com/FdU3678VG4nLICbTVRbZub';
        const modal = document.getElementById('scribe-application-modal');
        const modalContent = modal ? modal.querySelector('.bg-white') || modal.firstElementChild : null;

        if (modalContent) {
            modalContent.innerHTML = `
                <div style="text-align: center; padding: 30px; font-family: 'Poppins', sans-serif;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Upgrade Successful!</h2>
                    <p style="color: #64748b; margin-bottom: 25px;">You are now a Scribe. Join the official WhatsApp group to get started.</p>
                    <a href="${scribeLink}" target="_blank" style="background: #25d366; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
                        <i class="fa-brands fa-whatsapp" style="font-size: 20px;"></i> Join Scribe Team
                    </a>
                    <div style="margin-top: 25px;">
                        <button onclick="window.location.reload()" style="background: none; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; text-decoration: underline;">Refresh Dashboard</button>
                    </div>
                </div>
            `;
        } else {
            alert("Upgrade successful! Please join: " + scribeLink);
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
        alert("Failed to upgrade: " + error.message);
        btn.disabled = false;
        btn.innerHTML = "Submit & Upgrade";
    }
}

// ==========================================
// ARTICLE CREATOR STUDIO (Fix: article_approval)
// ==========================================
async function submitCreatorContent(e) {
    e.preventDefault();
    const btn = document.getElementById('cs-submit-btn');
    const titleInput = document.getElementById('cs-title');
    const classLevelInput = document.getElementById('cs-class-level');
    const contentInput = document.getElementById('cs-content');
    
    const userData = window.dashboardManager?.currentUserData;
    if (!userData) return alert("Session Error: User data not found.");

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
        const db = firebase.firestore();
        await db.collection("article_approval").add({
            title: titleInput.value.trim(),
            class_level: classLevelInput ? classLevelInput.value : "General",
            content: contentInput.value.trim(),
            authorId: userData.uid,
            authorName: userData.name,
            author_display: "Scribe",
            content_type: "article",
            type: "student_submission",
            status: "Pending Review",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('✅ Success! Your article has been submitted to the review queue. It will go live once a Mentor approves it.');
        document.getElementById('creator-submit-form').reset();
    } catch (error) {
        console.error("Submission Error:", error);
        alert("Failed to submit article. Please check your connection and try again.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// ==========================================
// PERFORMANCE & TICKETS (Fix: Arrays/Loops)
// ==========================================
async function fetchRecentPerformance(uid) {
    const tableBody = document.getElementById('performance-table-body');
    const tableHead = tableBody.previousElementSibling;

    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('test_results').where('uid', '==', uid).get();

        if (snapshot.empty) {
            tableHead.style.display = 'none';
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-10 border-none"><div class="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-[30px] max-w-[400px] mx-auto transition hover:bg-slate-100"><i class="fa-solid fa-flask-vial text-[40px] text-slate-400 mb-[15px]"></i><h4 class="m-0 mb-2 text-slate-900 font-['Poppins'] text-[18px]">No Data Found</h4><p class="m-0 mb-5 text-slate-500 text-[14px]">You haven't attempted any mock tests yet. Give it a try to see your analysis here!</p><a href="tests.html" class="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold no-underline inline-flex items-center gap-2 text-[14px] shadow-md hover:bg-slate-800 transition"><i class="fa-solid fa-play"></i> Take a Mock Test</a></div></td></tr>`;
            return;
        }

        tableHead.style.display = 'table-header-group';
        let testHistory = [];
        snapshot.forEach(doc => testHistory.push(doc.data()));

        testHistory.sort((a, b) => {
            let timeA = a.timestamp ? a.timestamp.toMillis() : 0;
            let timeB = b.timestamp ? b.timestamp.toMillis() : 0;
            return timeB - timeA;
        });

        testHistory = testHistory.slice(0, 5);
        tableBody.innerHTML = '';

        testHistory.forEach(data => {
            let dateStr = data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Recently";
            let accClass = data.accuracy >= 70 ? 'bg-green-100 text-green-600' : (data.accuracy < 40 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600');
            let accHTML = `<span class="px-2.5 py-1 rounded-full font-extrabold text-[12px] ${accClass}">${data.accuracy}%</span>`;

            tableBody.innerHTML += `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 border-b border-slate-100">
                        <div class="font-extrabold text-slate-900">${data.testTitle}</div>
                        <div class="text-[11px] text-slate-500">${Math.floor(data.timeSpent / 60)}m ${data.timeSpent % 60}s spent</div>
                    </td>
                    <td class="p-3 border-b border-slate-100 text-slate-600 text-[13px]">${dateStr}</td>
                    <td class="p-3 border-b border-slate-100">${accHTML}</td>
                    <td class="p-3 border-b border-slate-100 font-extrabold font-mono text-[16px] text-slate-900">${data.score}</td>
                </tr>`;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 p-5">Failed to load data. Please refresh.</td></tr>`;
    }
}

// 🟢 FIX: Array missing error resolved
window.fetchMyTickets = async function(uid) {
    const ticketList = document.getElementById('my-tickets-list');
    if (!ticketList) return;

    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('tickets').where('uid', '==', uid).get();

        if (snapshot.empty) {
            ticketList.innerHTML = `<div class="text-center text-slate-500 p-[15px] bg-slate-50 rounded-lg border border-dashed border-slate-300">No tickets raised yet. Need help? Ask above!</div>`;
            return;
        }

        ticketList.innerHTML = '';

        snapshot.forEach(doc => {
            const ticket = doc.data();
            ticket.id = doc.id;

            let dateStr = ticket.timestamp ? ticket.timestamp.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Recently";
            let isSolved = ticket.status === 'solved';
            let statusBadge = isSolved
                ? `<span class="bg-green-100 text-green-600 text-[10px] font-extrabold px-2 py-1 rounded text-center"><i class="fa-solid fa-check-circle"></i> SOLVED</span>`
                : `<span class="bg-amber-100 text-amber-600 text-[10px] font-extrabold px-2 py-1 rounded text-center"><i class="fa-solid fa-clock"></i> PENDING</span>`;

            let replyBox = (isSolved && ticket.reply) ? `
                <div class="mt-[15px] p-[15px] bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <div class="text-[11px] font-extrabold text-blue-600 mb-[5px] uppercase tracking-wide">Reply from Team</div>
                    <div class="text-[13px] text-blue-900 leading-relaxed">${ticket.reply}</div>
                </div>` : '';

            // Calling openTicketChat from ticketing.js if user clicks it
            let clickAction = typeof window.ticketingManager !== 'undefined' ? `onclick="window.ticketingManager.openTicketChat('${ticket.id}')"` : "";

            ticketList.innerHTML += `
                <div class="border border-slate-200 rounded-xl p-[15px] bg-white shadow-sm transition hover:shadow-md cursor-pointer" ${clickAction}>
                    <div class="flex justify-between items-start mb-[10px]">
                        <h4 class="m-0 text-[15px] text-slate-900 font-bold">${ticket.subject || 'Doubt'}</h4>
                        ${statusBadge}
                    </div>
                    <div class="text-[11px] text-slate-400 font-semibold mb-[10px]">Ticket ID: #${ticket.id.substring(0, 6).toUpperCase()} &bull; ${dateStr}</div>
                    <p class="m-0 text-[13px] text-slate-600 leading-relaxed">${ticket.description || ''}</p>
                    ${replyBox}
                </div>`;
        });
    } catch (error) {
        console.error("Ticket Fetch Error:", error);
        ticketList.innerHTML = `<div class="text-center text-red-500 p-[15px] bg-red-50 rounded-lg">Failed to load tickets. Please refresh.</div>`;
    }
}

async function loadParentDashboard(linkedChildId) {
    const placeholder = document.getElementById('child-stats-placeholder');
    if (!placeholder) return;

    if (!linkedChildId) {
        placeholder.innerHTML = `<div style="color:#ef4444; padding: 10px;"><i class="fa-solid fa-triangle-exclamation"></i> No linked Student ID found. Please contact Support.</div>`;
        return;
    }

    placeholder.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching data for Student ID: <b>${linkedChildId}</b>...`;

    try {
        const doc = await firebase.firestore().collection("users").doc(linkedChildId).get();
        if (!doc.exists) throw new Error("Student ID not found.");

        const childData = doc.data();
        const childName = childData.name || 'Student';
        const childAvatar = childData.pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(childName)}&background=16a34a&color=fff&bold=true`;
        
        placeholder.innerHTML = `
            <div style="background: white; border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;">
                    <img src="${childAvatar}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #bbf7d0; object-fit: cover;">
                    <div>
                        <h4 style="margin: 0; font-family: 'Poppins'; font-size: 16px; color: var(--text-main);">${childName}</h4>
                        <div style="font-family: monospace; font-size: 12px; color: #16a34a; font-weight: 700; background: #f0fdf4; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">ID: ${childData.customId || childData.uid.substring(0,6).toUpperCase()}</div>
                    </div>
                </div>
                <h5 style="margin: 0 0 15px 0; font-family: 'Poppins'; font-size: 14px; color: var(--text-main);"><i class="fa-solid fa-chart-line" style="color: #10b981;"></i> ${childName}'s Learning Progress</h5>
                
                <div class="progress-group">
                    <div class="progress-header"><span>Overall Activity</span> <span>85%</span></div>
                    <div class="progress-track"><div class="progress-fill" style="background: #3b82f6; width: 85%;"></div></div>
                </div>
            </div>
        `;
    } catch (error) {
        placeholder.innerHTML = `<div style="color:#ef4444; padding: 10px;"><i class="fa-solid fa-triangle-exclamation"></i> System error loading student data.</div>`;
    }
}

async function loadStudentDashboardData(uid) {
    const ticketCountEl = document.getElementById('active-tickets-count');
    if (!ticketCountEl) return;
    try {
        const snapshot = await firebase.firestore().collection("tickets")
            .where("uid", "==", uid)
            .where("status", "in", ["Open", "Pending", "open", "pending"]).get();
        ticketCountEl.innerText = snapshot.size;
    } catch (error) {
        ticketCountEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:14px;"></i>';
    }
}

window.dashboardManager = window.dashboardManager || {};
Object.assign(window.dashboardManager, { routeDashboard, hideAllViews, updatePortalTitle, loadParentDashboard, loadStudentDashboardData, submitCreatorContent });
window.submitCreatorContent = submitCreatorContent;

// ==========================================
// NOTIFICATION LOGIC
// ==========================================
function listenToNotifications(uid) {
    const db = firebase.firestore();
    db.collection("notifications").where("uid", "==", uid).orderBy("timestamp", "desc").limit(10).onSnapshot((snapshot) => {
        const badge = document.getElementById('notif-badge');
        const bellIcon = document.getElementById('bell-icon');
        const dropBody = document.getElementById('nd-body-content');
        if (!badge || !bellIcon || !dropBody) return;

        let unreadCount = 0;
        let html = '';

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const notif = doc.data();
                if (!notif.read) unreadCount++;
                const timeStr = notif.timestamp ? notif.timestamp.toDate().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now';
                const unreadClass = notif.read ? '' : 'unread';
                html += `<div class="nd-item ${unreadClass}"><div class="nd-title">${notif.title}</div><div class="nd-text">${notif.body}</div><div class="nd-time">${timeStr}</div></div>`;
            });
        } else {
            html = '<div class="nd-empty">No notifications yet</div>';
        }

        dropBody.innerHTML = html;
        if (unreadCount > 0) {
            badge.style.display = 'inline-block';
            badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
            bellIcon.classList.add('bell-ringing');
        } else {
            badge.style.display = 'none';
            bellIcon.classList.remove('bell-ringing');
        }
    });
}

window.toggleNotifications = async function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
        const bellIcon = document.getElementById('bell-icon');
        if (bellIcon) bellIcon.classList.remove('bell-ringing');
        
        const user = window.authManager?.auth?.currentUser;
        if (!user) return;
        
        try {
            // Updated to direct firebase call to avoid backend failure
            const db = firebase.firestore();
            const unreadNotifs = await db.collection("notifications").where("uid", "==", user.uid).where("read", "==", false).get();
            
            const batch = db.batch();
            unreadNotifs.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            await batch.commit();
        } catch(err) {
            console.error("Notif update error", err);
        }
    }
};

document.addEventListener('click', (event) => {
    const bellWrapper = document.getElementById('bell-icon-wrapper');
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown && dropdown.classList.contains('active') && !bellWrapper.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

function triggerNotificationPrompt() {
    if (!localStorage.getItem('notif_prompt_shown')) {
        setTimeout(() => {
            const prompt = document.getElementById('push-soft-prompt');
            if (prompt) {
                prompt.style.display = 'flex';
                localStorage.setItem('notif_prompt_shown', 'true'); 
            }
        }, 3000);
    }
}