// ==========================================
// js/dashboard.js - UI Routing & Dashboard Controller
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Auth Listener (Requires js/auth.js to be loaded first)
    if (window.authManager) {
        window.authManager.initializeAuthListener(handleUserLoaded, handleUserUnauthenticated);
    } else {
        console.error("Auth module not loaded! Ensure js/auth.js is included.");
    }

    // 2. Setup God Mode Switcher
    setupGodMode();

    // 3. Setup Logout Navigation
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.authManager) window.authManager.handleLogout();
        });
    }

    // 4. Setup Sidebar Accordion Logic (Mobile/Tablet)
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
        // Create an overlay div dynamically
        let overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Open Sidebar
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Scroll lock
        });

        // Close Sidebar when clicking outside (on the overlay)
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Remove scroll lock
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

    // Default Fallbacks
    let name = user.displayName || "Student";
    let email = user.email;
    let role = "student";
    let pic = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&bold=true`;

    // Hydrate from Firestore User Document
    if (userData) {
        name = userData.name || name;
        email = userData.email || email;
        role = userData.role ? userData.role.toLowerCase() : "student";
        if (userData.pic) pic = userData.pic;
    } else {
        console.warn("⚠️ Warning: Firestore user document does not exist. Using fallback auth data.");
    }
    
    // DYNAMIC UI MASKING ENGINE
    const displayRole = role.toUpperCase();
    const prefix = displayRole === 'STUDENT' ? 'STU' : (displayRole === 'PARENT' ? 'PRN' : (displayRole === 'MENTOR' ? 'MNT' : 'ADM'));
    let displayId = "XG-" + prefix + "-" + user.uid.substring(0,6).toUpperCase();

   // STEALTH FOUNDER OVERRIDE (Hardcoded UID Security)
    const founder1_UID = 'XCxglOl7FzLyRIFgl4SXNiW9VKA3'; 
    const founder2_UID = 'EZpI9ea4b0X8x8vOhxzar5KNzAw1'; 

    if (user.uid === founder1_UID || user.uid === founder2_UID) {
        role = 'founder';
        name = (user.uid === founder1_UID) ? 'Ashutosh Kaushal' : 'Shiwendu Kaushal';
        displayId = (user.uid === founder1_UID) ? 'XG-F-AK' : 'XG-F-SK';
        
        const controls = document.getElementById('founder-controls');
        if (controls) controls.style.display = 'block';
        
        // 🔥 THE FIX: Tell CSS that God Mode banner is taking 40px space
        document.documentElement.style.setProperty('--god-mode-height', '40px');
        
        // Developer Console Trick applied (View As)
        const viewAsRole = sessionStorage.getItem('viewAs');
        if (viewAsRole) {
            role = viewAsRole; 
            console.warn(`[God Mode] Viewing UI as: ${role.toUpperCase()}`);
        }
    }

    // Save current user data globally so other scripts can access it easily
    window.dashboardManager = window.dashboardManager || {};
    window.dashboardManager.currentUserData = { uid: user.uid, name, email, role, displayId };

    // 4. Update Global DOM Elements safely
    setElText('display-name', name);
    setElText('u-name', name);
    setElText('u-id', displayId);
    setElSrc('u-avatar', pic);
    
    setElText('p-name', name);
    setElText('p-email', email);
    setElText('p-role', role.toUpperCase().replace('_', ' '));
    setElSrc('p-img', pic);

    updatePortalTitle(role);

    // 5. ROLE-BASED ROUTING LOGIC
    routeDashboard(role);
    
    // 5.1 🔥 TEAM WORKFLOW TRIGGER (Connects to ticket-workflow.js)
    if (role.startsWith('mentor') || role.startsWith('support')) {
        if (window.workflowManager) {
            window.workflowManager.loadSharedPool(role);
            window.workflowManager.loadActiveDesk(user.uid, role);
        } else {
            console.error("Workflow Manager missing! Ensure ticket-workflow.js is loaded BEFORE dashboard.js");
        }
    }
    
    // 5.5 INJECT MEGAPHONE (Higher Authority Only)
    const isHigherAuthority = role === 'founder' || role.startsWith('admin') || role.endsWith('_sr');
    if (isHigherAuthority) {
        const actionsContainer = document.querySelector('.workspace-actions');
        if (actionsContainer && !document.getElementById('open-bcast-btn')) {
            const btn = document.createElement('button');
            btn.id = 'open-bcast-btn';
            btn.className = 'auth-btn';
            btn.style.background = '#f59e0b';
            btn.style.color = '#0f172a';
            btn.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Broadcast';
            btn.onclick = () => { document.getElementById('broadcast-modal').style.display = 'flex'; };
            
            // Ye broadcast button ko notification bell ke pehle daal dega
            actionsContainer.prepend(btn);
        }
    }

    // 6. TICKETING SYSTEM INIT 
    if (window.ticketingManager && typeof window.ticketingManager.initCategories === 'function') {
        window.ticketingManager.initCategories(role);
    }

    // 7. Reveal Dashboard & Hide Loader
    setElDisplay('loader', 'none');
    setElDisplay('dashboard-content', 'block');
    
    // 8. Load External Stats (Parent & Student)
    if (role === 'parent' && userData && userData.linkedChildId) {
        loadParentDashboard(userData.linkedChildId);
    }
    if (role === 'student' || role === 'student_writer') {
        loadStudentDashboardData(user.uid);
    }

    // 9. Initialize Notifications & Listeners
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
    
    if (role === 'founder') portalTitle.innerText = 'Founder God-Mode';
    else if (role.startsWith('admin')) portalTitle.innerText = 'Admin Headquarters';
    else if (role.startsWith('mentor')) portalTitle.innerText = 'Mentor Workspace';
    else if (role.startsWith('support')) portalTitle.innerText = 'Support Helpdesk';
    else if (role === 'parent') portalTitle.innerText = 'Parent Portal';
    else if (role === 'student_writer' || role === 'writer') portalTitle.innerText = 'Writer Portal';
    else portalTitle.innerText = 'Student Portal';
}

function hideAllViews() {
    const views = ['student-view', 'parent-view', 'writer-tools', 'mentor-view', 'support-view', 'admin-view', 'fallback-banner', 'help-desk-section'];
    views.forEach(view => setElDisplay(view, 'none'));
}

// THE STRICT RBAC ROUTING ENGINE
function routeDashboard(role) {
    hideAllViews();
    
    // --- NON-TEAM ROLES ---
    if (role === 'student') {
        setElDisplay('student-view', 'block');
        setElDisplay('help-desk-section', 'block'); // Let students raise tickets
    } 
    else if (role === 'parent') {
        setElDisplay('parent-view', 'block');
        setElDisplay('help-desk-section', 'block'); // Let parents raise tickets
    } 
    else if (role === 'student_writer') {
        setElDisplay('student-view', 'block');
        setElDisplay('writer-tools', 'block'); // Dual role access
        setElDisplay('help-desk-section', 'block');
    } 
    
    // --- TEAM ROLES ---
    else if (role === 'writer') {
        setElDisplay('writer-tools', 'block'); 
        setElDisplay('help-desk-section', 'block'); // Internal team ticketing
    } 
    else if (role === 'mentor_jr' || role === 'mentor_sr') {
        setElDisplay('mentor-view', 'block');
        setElDisplay('help-desk-section', 'block');
    } 
    else if (role === 'support_jr' || role === 'support_sr') {
        setElDisplay('support-view', 'block');
        setElDisplay('help-desk-section', 'block');
    } 
    
    // --- EXECUTIVE ROLES ---
    else if (role.startsWith('admin') || role === 'founder') {
        setElDisplay('admin-view', 'block');
        
        // DEPARTMENT ISOLATION FOR ADMINS
        const btnMnt = document.getElementById('btn-admin-mnt');
        const btnSup = document.getElementById('btn-admin-sup');
        
        if (btnMnt && btnSup) {
            if (role === 'admin_mentor') {
                btnMnt.style.display = 'flex';
                btnSup.style.display = 'none';
            } else if (role === 'admin_support') {
                btnMnt.style.display = 'none';
                btnSup.style.display = 'flex';
            } else { 
                // Admin Global & Founder can see both
                btnMnt.style.display = 'flex';
                btnSup.style.display = 'flex';
            }
        }
    }
    
    // --- FALLBACK (If role doesn't match) ---
    else {
        setElDisplay('student-view', 'block'); 
        setElDisplay('fallback-banner', 'flex');
        let displayRole = role.charAt(0).toUpperCase() + role.slice(1);
        setElText('fallback-text', `Unrecognized Role or Dashboard under construction. Defaulting to Student View.`);
    }
}

function setupGodMode() {
    const godModeSwitch = document.getElementById('god-mode-switch');
    if (godModeSwitch) {
        godModeSwitch.value = sessionStorage.getItem('viewAs') || '';
        godModeSwitch.addEventListener('change', (event) => {
            if (event.target.value) {
                sessionStorage.setItem('viewAs', event.target.value);
            } else {
                sessionStorage.removeItem('viewAs');
            }
            location.reload();
        });
    }
}

// Data bridge fetchers
async function loadParentDashboard(linkedChildId) {
    const placeholder = document.getElementById('child-stats-placeholder');
    if (!placeholder) return;

    if (!linkedChildId) {
        placeholder.innerHTML = `<div style="color:#ef4444; padding: 10px;"><i class="fa-solid fa-triangle-exclamation"></i> No linked Student ID found in your profile. Please contact Support.</div>`;
        return;
    }

    placeholder.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Fetching data for Student ID: <b>${linkedChildId}</b>...`;

    try {
        const db = window.authManager ? window.authManager.db : firebase.firestore();
        const childQuery = await db.collection('users').where('customId', '==', linkedChildId).get();
        
        if (childQuery.empty) {
            placeholder.innerHTML = `<div style="color:#ef4444; padding: 10px;"><i class="fa-solid fa-circle-xmark"></i> Student ID (${linkedChildId}) not found in the database.</div>`;
            return;
        }

        const childData = childQuery.docs[0].data();
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
                
                <div style="margin-top: 15px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-circle-info"></i> Full analytics will unlock when the Mock Test Engine goes live.
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
    if (!ticketCountEl || !window.authManager) return;

    try {
        const db = window.authManager.db;
        const ticketsQuery = await db.collection('tickets')
            .where('uid', '==', uid)
            .where('status', '==', 'Open')
            .get();
        
        ticketCountEl.innerText = ticketsQuery.size;
    } catch (error) {
        console.error("Error fetching student tickets:", error);
        ticketCountEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:14px;"></i>';
    }
}

// Expose globally to window if other scripts need routing control
window.dashboardManager = window.dashboardManager || {};
Object.assign(window.dashboardManager, { routeDashboard, hideAllViews, updatePortalTitle, loadParentDashboard, loadStudentDashboardData });

window.triggerManualBroadcast = async function() {
    const title = document.getElementById('bcast-title').value.trim();
    const body = document.getElementById('bcast-body-text').value.trim();
    const target = document.getElementById('bcast-target').value;
    const dept = document.getElementById('bcast-dept').value;

    if (!title || !body) return alert("Title and Message are required.");

    const btn = document.querySelector('.bcast-send-btn');
    const ogText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...'; 
    btn.disabled = true;

    if (window.notificationManager && typeof window.notificationManager.sendManualBroadcast === 'function') {
        await window.notificationManager.sendManualBroadcast(target, title, body, dept);
    } else {
        alert("Notification Manager not loaded.");
    }

    btn.innerHTML = ogText; 
    btn.disabled = false;
    document.getElementById('broadcast-modal').style.display = 'none';
    document.getElementById('bcast-title').value = '';
    document.getElementById('bcast-body-text').value = '';
};

// ==========================================
// NOTIFICATION CENTER LOGIC
// ==========================================
function listenToNotifications(uid) {
    const db = window.authManager.db;
    db.collection('users').doc(uid).collection('notifications')
      .orderBy('timestamp', 'desc').limit(20)
      .onSnapshot(snapshot => {
          const badge = document.getElementById('notif-badge');
          const bellIcon = document.getElementById('bell-icon');
          const dropBody = document.getElementById('nd-body-content');
          
          if (!badge || !bellIcon || !dropBody) return;
          
          let unreadCount = 0;
          let html = '';
          
          snapshot.forEach(doc => {
              const data = doc.data();
              if (!data.read) unreadCount++;
              
              const timeStr = new Date(data.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
              const unreadClass = data.read ? '' : 'unread';
              
              html += `
                  <div class="nd-item ${unreadClass}">
                      <div class="nd-title">${data.title}</div>
                      <div class="nd-text">${data.body}</div>
                      <div class="nd-time">${timeStr}</div>
                  </div>
              `;
          });
          
          if (snapshot.empty) html = '<div class="nd-empty">No notifications yet</div>';
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

window.toggleNotifications = function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    
    dropdown.classList.toggle('active');
    
    // Mark as read when opened
    if (dropdown.classList.contains('active')) {
        const bellIcon = document.getElementById('bell-icon');
        if (bellIcon) bellIcon.classList.remove('bell-ringing');
        
        const user = window.authManager.auth.currentUser;
        if (!user) return;
        const db = window.authManager.db;
        
        db.collection('users').doc(user.uid).collection('notifications')
          .where('read', '==', false)
          .get().then(snap => {
              const batch = db.batch();
              snap.forEach(doc => batch.update(doc.ref, { read: true }));
              batch.commit();
          });
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const bellWrapper = document.getElementById('bell-icon-wrapper');
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown && dropdown.classList.contains('active')) {
        if (!bellWrapper.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    }
});
// ==========================================
// DASHBOARD UI LOGIC (Broadcast & Notifications)
// ==========================================

// 1. Check Role and Show/Hide Broadcast Button
function setupBroadcastButton(role) {
    const bcastBtn = document.getElementById('open-bcast-btn');
    const allowedAdminRoles = ['admin', 'founder', 'admin_global', 'admin_mentor', 'admin_support'];
    
    if (bcastBtn) {
        // Agar selected role 'allowedAdminRoles' ki list mein hai, toh 'flex' (show) karo, varna 'none' (hide)
        if (allowedAdminRoles.includes(role)) {
            bcastBtn.style.display = 'flex';
        } else {
            bcastBtn.style.display = 'none';
        }
    }
}

// 2. Trigger Notification Permission Popup
function triggerNotificationPrompt() {
    // Check agar user ne pehle dismiss nahi kiya hai
    if (!localStorage.getItem('notif_prompt_shown')) {
        setTimeout(() => {
            const prompt = document.getElementById('push-soft-prompt');
            if (prompt) {
                prompt.style.display = 'flex';
                // Mark as shown so it doesn't annoy them on every refresh
                localStorage.setItem('notif_prompt_shown', 'true'); 
            }
        }, 3000); // Page load hone ke 3 second baad aayega
    }
}

// 3. Auto-Connect with Dashboard Events
document.addEventListener('DOMContentLoaded', () => {
    // Notification popup trigger karo
    triggerNotificationPrompt();

    // God Mode Dropdown ke change hone par Broadcast button update karo
    const godModeSwitch = document.getElementById('god-mode-switch');
    if (godModeSwitch) {
        godModeSwitch.addEventListener('change', (e) => {
            const selectedRole = e.target.value;
            setupBroadcastButton(selectedRole);
        });
    }
});

// 4. Global Export (Agar auth.js se call karna pade future mein)
window.dashboardUI = {
    applyRoleFeatures: setupBroadcastButton
};