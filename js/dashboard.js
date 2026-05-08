// ==========================================
// js/dashboard.js - PUBLIC UI Routing & Dashboard Controller
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Auth Listener (Requires js/auth.js to be loaded first)
    if (window.authManager) {
        window.authManager.initializeAuthListener(handleUserLoaded, handleUserUnauthenticated);
    } else {
        console.error("Auth module not loaded! Ensure js/auth.js is included.");
    }

    // 2. Setup Logout Navigation
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.authManager) window.authManager.handleLogout();
        });
    }

    // 3. Setup Sidebar Accordion Logic (Mobile/Tablet)
    const menuToggles = document.querySelectorAll('.menu-toggle');
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentLi = this.closest('.has-submenu');
            
            // Close other open submenus
            document.querySelectorAll('.has-submenu').forEach(item => {
                if (item !== parentLi) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current submenu
            if (parentLi) parentLi.classList.toggle('active');
        });
    });

    // --- MOBILE SIDEBAR TOGGLE LOGIC ---
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

    // Trigger Notification Popup (Safe for public)
    triggerNotificationPrompt();
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

    // Default Fallbacks
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
    
    // DYNAMIC UI MASKING ENGINE
    const displayRole = role.toUpperCase();
    const prefix = displayRole === 'STUDENT' ? 'STU' : (displayRole === 'PARENT' ? 'PRN' : 'USR');
    let displayId = "XG-" + prefix + "-" + user.uid.substring(0,6).toUpperCase();

    window.dashboardManager = window.dashboardManager || {};
    window.dashboardManager.currentUserData = { uid: user.uid, name, email, role, displayId };

    // Update UI Elements
    setElText('display-name', name);
    setElText('u-name', name);
    setElText('u-id', displayId);
    setElSrc('u-avatar', pic);
    
    setElText('p-name', name);
    setElText('p-email', email);
    setElText('p-role', role.toUpperCase().replace('_', ' '));
    setElSrc('p-img', pic);

    updatePortalTitle(role);

    // Strict Public Routing
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
    }

    if (window.notificationManager) {
        window.notificationManager.initializeNotifications(role, user.uid);
    }
    listenToNotifications(user.uid);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function setElText(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; }
function setElSrc(id, src) { const el = document.getElementById(id); if (el) el.src = src; }
function setElDisplay(id, display) { const el = document.getElementById(id); if (el) el.style.display = display; }

function updatePortalTitle(role) {
    const portalTitle = document.getElementById('portal-title');
    if (!portalTitle) return;
    
    if (role === 'parent') portalTitle.innerText = 'Parent Portal';
    else if (role === 'student_writer') portalTitle.innerText = 'Writer Portal';
    else portalTitle.innerText = 'Student Portal';
}

function hideAllViews() {
    const views = ['student-view', 'parent-view', 'writer-tools', 'creator-studio-widget', 'fallback-banner', 'help-desk-section'];
    views.forEach(view => setElDisplay(view, 'none'));
}

// THE STRICT PUBLIC RBAC ROUTING ENGINE
function routeDashboard(role) {
    hideAllViews();
    
    if (role === 'student') {
        setElDisplay('student-view', 'block');
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
        setElText('fallback-text', `Unrecognized Role. Defaulting to Student View.`);
    }
}

async function submitCreatorContent(e) {
    e.preventDefault();
    const btn = document.getElementById('cs-submit-btn');
    const titleInput = document.getElementById('cs-title');
    const contentInput = document.getElementById('cs-content');
    
    const userData = window.dashboardManager?.currentUserData;
    if (!userData) return alert("Session Error: User data not found.");

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
        // 🟢 FIX: Seedha Firebase Database me Article "Pending Review" status ke sath push kar diya!
        const db = firebase.firestore();
        await db.collection("articles").add({
            title: titleInput.value.trim(),
            content: contentInput.value.trim(),
            authorId: userData.uid,
            authorName: userData.name,
            type: "student_submission",
            status: "Pending Review", // Strictly requires Admin/Mentor approval
            isLive: false, // Explicit flag for visibility
            deleteStatus: "Inactive",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('✅ Success! Your article has been submitted. It will go live once a Mentor reviews and approves it.');
        document.getElementById('creator-submit-form').reset();
    } catch (error) {
        console.error("Submission Error:", error);
        alert("Failed to submit article. Please check your connection and try again.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
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
        const response = await fetch(`${window.BASE_URL}/parent/child-data?child_id=${linkedChildId}`);
        const result = await response.json();

        if (result.status !== 'success') throw new Error(result.message || "Student ID not found.");

        const childData = result.data;
        const childName = childData.name || 'Student';
        const childAvatar = childData.pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(childName)}&background=16a34a&color=fff&bold=true`;
        
        placeholder.innerHTML = `
            <div style="background: white; border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;">
                    <img src="${childAvatar}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid #bbf7d0; object-fit: cover;">
                    <div>
                        <h4 style="margin: 0; font-family: 'Poppins'; font-size: 16px; color: var(--text-main);">${childName}</h4>
                        <div style="font-family: monospace; font-size: 12px; color: #16a34a; font-weight: 700; background: #f0fdf4; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">ID: ${childData.customId}</div>
                    </div>
                </div>
                <h5 style="margin: 0 0 15px 0; font-family: 'Poppins'; font-size: 14px; color: var(--text-main);"><i class="fa-solid fa-chart-line" style="color: #10b981;"></i> ${childName}'s Learning Progress</h5>
                
                <div class="progress-group">
                    <div class="progress-header"><span>Overall Activity</span> <span>85%</span></div>
                    <div class="progress-track"><div class="progress-fill" style="background: #3b82f6; width: 85%;"></div></div>
                </div>
                <div class="progress-group">
                    <div class="progress-header"><span>Mock Test Average</span> <span style="color:#d97706;">Pending</span></div>
                    <div class="progress-track"><div class="progress-fill" style="background: #cbd5e1; width: 0%;"></div></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching child data:", error);
        placeholder.innerHTML = `<div style="color:#ef4444; padding: 10px;"><i class="fa-solid fa-triangle-exclamation"></i> System error loading student data.</div>`;
    }
}

async function loadStudentDashboardData(uid) {
    const ticketCountEl = document.getElementById('active-tickets-count');
    if (!ticketCountEl) return;

    try {
        const response = await fetch(`${window.BASE_URL}/student/stats?uid=${uid}`);
        const result = await response.json();
        if (result.status === 'success') ticketCountEl.innerText = result.data.open_tickets_count || 0;
    } catch (error) {
        ticketCountEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:14px;"></i>';
    }
}

// Global Exports
window.dashboardManager = window.dashboardManager || {};
Object.assign(window.dashboardManager, { routeDashboard, hideAllViews, updatePortalTitle, loadParentDashboard, loadStudentDashboardData, submitCreatorContent });
window.submitCreatorContent = submitCreatorContent;


// ==========================================
// NOTIFICATION LOGIC (Public Version)
// ==========================================
async function listenToNotifications(uid) {
    const fetchUnread = async () => {
        try {
            const response = await fetch(`${window.BASE_URL}/notifications/unread?uid=${uid}`);
            const result = await response.json();
            if (result.status !== 'success') return;

            const badge = document.getElementById('notif-badge');
            const bellIcon = document.getElementById('bell-icon');
            const dropBody = document.getElementById('nd-body-content');
            
            if (!badge || !bellIcon || !dropBody) return;
            
            let unreadCount = result.unread_count || 0;
            let html = '';
            
            if (result.data && result.data.length > 0) {
                result.data.forEach(notif => {
                    const timeStr = new Date(notif.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
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
        } catch (error) {}
    };
    fetchUnread();
    setInterval(fetchUnread, 180000);
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
        
        await fetch(`${window.BASE_URL}/notifications/mark-read`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: user.uid })
        });
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