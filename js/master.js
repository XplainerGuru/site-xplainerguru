// ==========================================
// js/master.js - PUBLIC GLOBAL CONFIGURATION 
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwq33obEvRjmPhOU-TDhsgrReHTXzL8RcKKey_UauwQBmHYpzeO7pmbluzZeMxd4mYQ/exec";

const CONFIG = {
    email: "xplainerguru@gmail.com",
    waChannel: "https://whatsapp.com/channel/0029Vb7p4QV0QeadmOIpgx36",
    waScribeGroup: "https://chat.whatsapp.com/FdU3678VG4nLICbTVRbZub", 
    ig: "https://instagram.com/xplainerguru",
    yt: "https://youtube.com/@xplainerguru",
    fb: "https://facebook.com/xplainerguru",
    developer: { website: "https://coderkaushal.netlify.app" }
};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('xg-injected')) return; 

    const authPages = ['login.html', 'signup.html'];
    const isAuthPage = authPages.some(page => window.location.pathname.includes(page));

    const masterCSS = `
    <style>
        body { margin: 0; padding-top: ${isAuthPage ? '0' : '72px'}; font-family: 'Manrope', sans-serif; background: #f8fafc; color: #334155; display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden; }
        header { background: rgba(255, 255, 255, 0.98); height: 72px; width: 100%; position: fixed; top: 0; left: 0; z-index: 9000; backdrop-filter: blur(8px); box-sizing: border-box; border-bottom: 1px solid #e2e8f0; }
        .brand { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: clamp(1.2rem, 4vw, 1.5rem); display: flex; align-items: center; gap: 8px; color: #0f172a; text-decoration: none; letter-spacing: -0.5px; }
        .brand img { height: 38px; width: 38px; border-radius: 50%; object-fit: cover; }
        
        /* PROFILE DROPDOWN */
        .auth-wrapper { position: relative; display: flex; align-items: center;}
        .login-btn { background: #2563eb; color: #fff; padding: 6px 16px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; transition: 0.3s; box-shadow: 0 4px 10px rgba(37,99,235,0.2); white-space: nowrap; }
        .login-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
        .profile-btn { cursor: pointer; border: none; background: none; padding: 0; display: flex; align-items: center; gap: 8px;}
        .profile-btn img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #e2e8f0; object-fit: cover; transition: 0.3s; }
        .profile-btn:hover img { border-color: #2563eb; }
        .profile-dropdown { position: absolute; top: 60px; right: 0; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 15px; width: 220px; overflow: hidden; border: 1px solid #e2e8f0; display: none; flex-direction: column; z-index: 10000; transform-origin: top right; animation: scaleIn 0.2s ease;}
        .profile-dropdown.active { display: flex; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .pd-header { padding: 15px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .pd-name { font-family: 'Poppins'; font-size: 14px; color: #0f172a; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin:0 0 2px;}
        .pd-email { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin:0;}
        .pd-link { padding: 12px 15px; text-decoration: none; color: #334155; font-size: 13px; font-weight: 600; transition: 0.2s; display: flex; align-items: center; gap: 10px;}
        .pd-link:hover { background: #f1f5f9; color: #2563eb; padding-left: 20px;}
        .pd-logout { color: #ef4444; border-top: 1px solid #e2e8f0; }
        .pd-logout:hover { background: #fee2e2; color: #dc2626; padding-left: 15px;}

        /* CLEAN DRAWER MENU */
        #drawer { position: fixed; top: 0; left: -320px; width: min(320px, 85vw); height: 100%; background: #0f172a; z-index: 10001; transition: cubic-bezier(0.4, 0, 0.2, 1) 0.4s; padding: 40px clamp(20px, 5vw, 40px); display: flex; flex-direction: column; box-shadow: 10px 0 30px rgba(0,0,0,0.3); box-sizing: border-box; overflow-y: auto; }
        #drawer.open { left: 0 !important; }
        #drawer-mask { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; backdrop-filter: blur(4px); }
        .d-link { color: #94a3b8; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'Poppins', sans-serif; font-weight: 600; text-decoration: none; font-size: 16px; display: block; transition: 0.3s; }
        .d-link:hover { color: #fff; padding-left: 10px; border-color: rgba(255,255,255,0.2); }
        .d-user-card { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.3s;}
        .d-user-card:hover { background: rgba(255,255,255,0.1); }
        .d-user-card img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover;}
        .d-social-footer { margin-top: auto; padding-top: 30px; display: flex; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
        .s-btn { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; text-decoration:none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .s-btn svg { width: 20px; fill: #fff; }
        .s-btn.wa { background: #25d366; }
        .s-btn.yt { background: #ff0000; }
        .s-btn.ig { background: #e4405f; }
        .s-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255,255,255,0.1); }

        footer { background: #0f172a; color: #94a3b8; padding: 60px 20px 30px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); }
        .ft-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px; }
        .ft-header { color: #fff; margin-bottom: 25px; font-weight: 700; border-left: 4px solid #f59e0b; padding-left: 15px; font-family: 'Poppins', sans-serif; letter-spacing: 0.5px; font-size: 1.1rem; }
        .ft-link { display: block; margin-bottom: 14px; font-size: 14px; text-decoration: none; color: inherit; transition: 0.2s; }
        .ft-link:hover { color: #fff; transform: translateX(5px); }
        .credits { text-align: center; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px; font-size: 13px; opacity: 0.8; }

        /* CHATBOT FLOATING UI */
        #xg-bot-fab { position: fixed; bottom: 25px; right: 25px; width: 60px; height: 60px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; z-index: 10000; box-shadow: 0 5px 20px rgba(37,99,235,0.4); transition: 0.3s ease; }
        #xg-bot-fab:hover { transform: scale(1.1) rotate(5deg); background: #1d4ed8; }
        #xg-bot-modal { position: fixed; bottom: 95px; right: 25px; width: min(350px, 90vw); height: 500px; background: white; border-radius: 24px; box-shadow: 0 15px 50px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; display: none; flex-direction: column; z-index: 10001; overflow: hidden; animation: botSlide 0.3s ease; font-family: 'Manrope', sans-serif; }
        .bot-header { background: #1e293b; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; shrink-0; }
        #xg-bot-body { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px; background: #f8fafc; scroll-behavior: smooth; }
        @keyframes botSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #xg-injected { display: none; }
    </style>
    <div id="xg-injected"></div>
    `;
    document.head.insertAdjacentHTML('beforeend', masterCSS);

    const headerHTML = `
    <header class="navbar" style="display:flex; align-items:center; padding: 0 20px;">
        <button onclick="toggleDrawer()" style="background:none; border:none; cursor:pointer; padding:8px; display:flex; align-items:center;">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <a href="index.html" class="brand" style="margin-right: auto; margin-left: 10px;">
            <img src="logo.png" alt="X" onerror="this.src='https://via.placeholder.com/38?text=X'">
            Xplainer<span style="color:#2563eb">Guru</span>
        </a>
        
        <div style="display: flex; align-items: center; gap: clamp(10px, 2vw, 20px);">
            <div id="global-bell-trigger" style="position: relative; cursor: pointer; display: flex; align-items: center;" onclick="toggleGlobalNotif(event)">
                <i class="fa-solid fa-bell" style="font-size: 20px; color: #64748b; transition: 0.3s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#64748b'"></i>
                <span id="global-notif-badge" style="background: #ef4444; color: white; border-radius: 50%; padding: 2px 5px; font-size: 10px; font-weight: 800; position: absolute; top: -8px; right: -8px; display: none;">0</span>
                <div id="global-notif-dropdown" style="position: absolute; top: 40px; right: -10px; width: clamp(280px, 90vw, 320px); background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; display: none; flex-direction: column; z-index: 10000; text-align: left; cursor: default; transform-origin: top right; animation: scaleIn 0.2s ease;">
                    <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; font-weight: 800; font-size: 14px; background: #f8fafc; color: #0f172a; border-radius: 12px 12px 0 0;">Notifications</div>
                    <div id="global-nd-body" style="max-height: 300px; overflow-y: auto;">
                        <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;">No new notifications</div>
                    </div>
                </div>
            </div>
            <div id="headerAuthContainer"><a href="login.html" class="login-btn">Login</a></div>
        </div>
    </header>
    `;

    const drawerHTML = `
    <div id="drawer-mask" onclick="toggleDrawer()"></div>
    <div id="drawer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <span style="color:#fff; font-family:'Poppins', sans-serif; font-size:1.5rem; font-weight:800;">Menu</span>
            <button onclick="toggleDrawer()" style="color:#fff; background:none; border:none; font-size:32px; cursor:pointer; opacity:0.8; transition:0.2s;">&times;</button>
        </div>
        <div id="drawerAuthContainer">
            <a href="login.html" class="d-link" style="color:#2563eb; font-weight:800; border-bottom:1px solid rgba(255,255,255,0.1);">Login / Register</a>
        </div>
        <div style="flex:1;">
            <a href="index.html" class="d-link">Home</a>
            <a href="videos.html" class="d-link">Video Classes</a>
            <a href="notes.html" class="d-link">Study Notes</a>
            <a href="articles.html" class="d-link">Study Articles</a>
            <a href="tests.html" class="d-link">Mock Tests</a>
            <a href="about.html" class="d-link">Our Team</a>
            <a href="careers.html" class="d-link" style="color:#8b5cf6;">Join our Team</a>
        </div>
        <div class="d-social-footer">
            <a href="${CONFIG.waChannel}" class="s-btn wa" target="_blank"><svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.23c-1.5 0-2.98-.39-4.28-1.14l-.3-.18-3.18.83.85-3.1-.19-.3c-.82-1.3-1.26-2.82-1.26-4.34 0-4.58 3.73-8.32 8.32-8.32 4.58 0 8.32 3.73 8.32 8.32 0 4.58-3.73 8.32-8.32 8.32zm4.56-6.24c-.25-.13-1.49-.73-1.72-.82-.23-.08-.39-.13-.56.13-.17.25-.65.82-.79.98-.15.17-.3.19-.55.07-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.01-.39.11-.51.11-.11.25-.3.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.24 3.74 1.63.7 2.26.75 3.09.63.92-.14 1.49-.61 1.7-1.19.22-.59.22-1.09.15-1.19-.06-.1-.23-.17-.48-.3z"/></svg></a>
            <a href="${CONFIG.yt}" class="s-btn yt" target="_blank"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="${CONFIG.ig}" class="s-btn ig" target="_blank"><svg viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg></a>
            <a href="${CONFIG.fb}" class="s-btn ig" target="_blank" style="background:#1877f2;"><i class="fa-brands fa-facebook-f" style="color:white; font-size:18px;"></i></a>
        </div>
    </div>
    `;

    const footerHTML = `
    <footer>
        <div class="ft-grid">
            <div class="ft-col">
                <a href="index.html" class="brand" style="color:#fff; margin-bottom:20px; display:inline-block;">Xplainer<span style="color:#2563eb">Guru</span></a>
                <p style="font-size:14px; line-height:1.7; opacity:0.8;">Empowering students with accessible, high-quality education.</p>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Quick Access</h4>
                <a href="index.html" class="ft-link">Home Page</a>
                <a href="videos.html" class="ft-link">Video Classes</a>
                <a href="notes.html" class="ft-link">Study Notes</a>
                <a href="articles.html" class="ft-link">Study Articles</a>
                <a href="tests.html" class="ft-link">Mock Tests</a>
                <a href="about.html" class="ft-link">Our Team</a>
                <a href="careers.html" class="ft-link">Join our Team</a>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Legal & Policies</h4>
                <a href="privacy.html" class="ft-link">Privacy Policy</a>
                <a href="terms.html" class="ft-link">Terms of Service</a>
                <a href="refund.html" class="ft-link">Refund Policy</a>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Connect with Us</h4>
                <a href="mailto:${CONFIG.email}" class="ft-link"><i class="fa-solid fa-envelope"></i> Email Support</a>
                <a href="${CONFIG.waChannel}" target="_blank" class="ft-link"><i class="fa-brands fa-whatsapp"></i> WhatsApp Channel</a>
                <a href="${CONFIG.ig}" target="_blank" class="ft-link"><i class="fa-brands fa-instagram"></i> Instagram</a>
                <a href="${CONFIG.yt}" target="_blank" class="ft-link"><i class="fa-brands fa-youtube"></i> YouTube</a>
                <a href="${CONFIG.fb}" target="_blank" class="ft-link"><i class="fa-brands fa-facebook"></i> Facebook Page</a>
            </div>
        </div>
        <div class="credits"> &copy; 2026 XplainerGuru. All rights reserved. <br> Engineered &amp; Architected by <a href="https://theauzent.netlify.app" target="_blank" rel="noopener noreferrer" style="color: #2563EB; font-weight: bold; text-decoration: underline;">Auzent</a>. </div>
    </footer>
    `;

    const chatbotHTML = `
    <div id="xg-bot-fab" onclick="window.chatbotManager.toggleBot()">
        <i class="fa-solid fa-robot"></i>
    </div>
    <div id="xg-bot-modal">
        <div class="bot-header">
            <div style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                <img src="bot-logo.png" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" alt="Bot Logo">
                Ya Bro
            </div>
            <div style="display: flex; gap: 15px; font-size: 20px; font-weight: bold; align-items: center;">
                <span onclick="window.chatbotManager.minimizeBot()" style="cursor: pointer; line-height: 1; padding: 0 5px;" title="Minimize">&#x2212;</span>
                <span onclick="window.chatbotManager.strictCloseBot()" style="cursor: pointer; color: #ef4444; line-height: 1; padding: 0 5px;" title="Close">&#x2715;</span>
            </div>
        </div>
        <div id="xg-bot-body"></div>
    </div>
    `;

    if (!isAuthPage) {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        document.body.insertAdjacentHTML('afterbegin', drawerHTML);
        document.body.insertAdjacentHTML('beforeend', footerHTML);
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    // --- ADSTERRA GLOBAL SOCIAL BAR ---
    const forbiddenPages = ['login.html', 'signup.html', 'privacy.html', 'terms.html', 'refund.html'];
    const isForbidden = forbiddenPages.some(page => window.location.pathname.includes(page));

    if (!isForbidden) {
        const socialBarScript = document.createElement('script');
        socialBarScript.type = "text/javascript";
        socialBarScript.src = "https://pl29365933.profitablecpmratenetwork.com/d9/ad/77/d9ad7765f13d86914dce64a5b431bd3b.js";
        socialBarScript.async = true;
        socialBarScript.setAttribute('data-cfasync', 'false');

        socialBarScript.onerror = function() {
            console.error("Adsterra Social Bar failed to load. Check for Ad-Blockers or CSP restrictions.");
        };

        document.body.appendChild(socialBarScript);
    }

    if (!isAuthPage) {
        checkAuthStatus();
        loadGlobalMic();
        
        // Universal Notification Prompt (Every page)
        triggerNotificationPrompt();
    }
});

// ==========================================
// SMART AUTHENTICATION ENGINE
// ==========================================
function checkAuthStatus() {
    const hAuth = document.getElementById('headerAuthContainer');
    const dAuth = document.getElementById('drawerAuthContainer');

    const renderLoggedOut = () => {
        if(hAuth) hAuth.innerHTML = `<a href="login.html" class="login-btn">Login</a>`;
        if(dAuth) dAuth.innerHTML = `<a href="login.html" class="d-link" style="color:#2563eb; font-weight:800; border-bottom:1px solid rgba(255,255,255,0.1);">Login / Register</a>`;
    };

    if (window.authManager) {
        window.authManager.initializeAuthListener((user, userData) => {
            if (!user) {
                renderLoggedOut();
                return;
            }

            let name = user.displayName || "Learner";
            let role = "student"; 
            
            if (userData) { 
                name = userData.name || name; 
                role = userData.role || "student";
            }

            const email = user.email || "";
            const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&rounded=true&bold=true`;
            
            let dashLink = `<a href="dashboard.html" class="pd-link" style="color:#2563eb; font-weight:800; background:#f1f5f9;"><i class="fa-solid fa-gauge-high"></i> Dashboard</a>`;
            let badgeHTML = `<div style="color:#94a3b8; font-size:12px; text-transform:capitalize;">${role}</div>`;

            if (hAuth) {
                hAuth.innerHTML = `
                    <div class="auth-wrapper">
                        <button class="profile-btn" onclick="toggleProfileDropdown(event)">
                            <img src="${avatar}" alt="Profile">
                            <i class="fa-solid fa-chevron-down" style="font-size:12px; color:#64748b;"></i>
                        </button>
                        <div class="profile-dropdown" id="profileDropdown">
                            <div class="pd-header">
                                <h4 class="pd-name">${name}</h4>
                                <p class="pd-email">${email}</p>
                            </div>
                            ${dashLink}
                            <a href="#" class="pd-link pd-logout" onclick="logoutUser()"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
                        </div>
                    </div>
                `;
            }

            if (dAuth) {
                dAuth.innerHTML = `
                    <div class="d-user-card" onclick="window.location.href='dashboard.html'">
                        <img src="${avatar}">
                        <div>
                            <div style="color:#fff; font-family:'Poppins'; font-size:15px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;">${name}</div>
                            ${badgeHTML}
                        </div>
                    </div>
                    <a href="dashboard.html" class="d-link" style="color:#38bdf8;"><i class="fa-solid fa-gauge-high"></i> Open Dashboard</a>
                `;
            }
        }, renderLoggedOut);
    } else {
        renderLoggedOut();
    }
}

// 🌐 UI TOGGLES
window.toggleProfileDropdown = function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('profileDropdown');
    if(dropdown) dropdown.classList.toggle('active');
};

window.toggleGlobalNotif = function(e) {
    e.stopPropagation();
    const notifDropdown = document.getElementById('global-notif-dropdown');
    if (notifDropdown) notifDropdown.style.display = notifDropdown.style.display === 'flex' ? 'none' : 'flex';
};

document.addEventListener('click', () => {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && dropdown.classList.contains('active')) dropdown.classList.remove('active');
    
    const notifDropdown = document.getElementById('global-notif-dropdown');
    if (notifDropdown && notifDropdown.style.display === 'flex') notifDropdown.style.display = 'none';
});

window.logoutUser = function() {
    if(confirm("Log out completely?")) {
        if (window.authManager) window.authManager.handleLogout("index.html");
    }
};

window.toggleDrawer = function() {
    const d = document.getElementById("drawer");
    const m = document.getElementById("drawer-mask");
    if (d.classList.contains("open")) {
        d.classList.remove("open");
        m.style.display = "none";
    } else {
        d.classList.add("open");
        m.style.display = "block";
    }
};

window.syncToSheet = (data) => {
    const ua = navigator.userAgent;
    data.device = /android/i.test(ua) ? "Android" : /windows/i.test(ua) ? "PC" : "Mobile";
    data.source = window.location.pathname;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            data.lat = pos.coords.latitude; 
            data.lng = pos.coords.longitude;
            postData(data);
        }, () => { 
            data.lat = "Denied"; 
            data.lng = "Denied"; 
            postData(data); 
        });
    } else { postData(data); }
};

const postData = (data) => {
    fetch(SCRIPT_URL, { method: "POST", mode: 'no-cors', body: JSON.stringify(data) }).catch(e => console.log(e));
};

// ==========================================
// 📢 THE GLOBAL MIC (Announcements)
// ==========================================
function loadGlobalMic() {
    const db = firebase.firestore();
    // Replacing Render GET with direct Firestore listener
    db.collection("system_settings").doc("global_mic").onSnapshot((doc) => {
        const existingMic = document.getElementById('xg-global-mic');
        if (existingMic) existingMic.remove();

        const data = doc.data();
        if (data && data.active) {
            const micHTML = `
                <div id="xg-global-mic" style="background: linear-gradient(90deg, #2563eb, #8b5cf6); color: white; text-align: center; padding: 10px 20px; font-size: 14px; font-family: 'Poppins', sans-serif; position: relative; z-index: 10005; display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; box-shadow: 0 4px 15px rgba(37,99,235,0.3);">
                    <span style="background: #fde68a; color: #d97706; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;"><i class="fa-solid fa-bolt"></i> ${data.tag || 'UPDATE'}</span>
                    <span style="font-weight: 600; line-height: 1.4;">${data.message}</span>
                    ${data.link ? `<a href="${data.link}" style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 12px; transition: 0.2s; white-space: nowrap;">Explore <i class="fa-solid fa-arrow-right"></i></a>` : ''}
                    <button onclick="document.getElementById('xg-global-mic').style.display='none'" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; cursor: pointer; font-size: 16px; opacity: 0.8;"><i class="fa-solid fa-xmark"></i></button>
                </div>`;
            document.body.insertAdjacentHTML('afterbegin', micHTML);
        }
    });
}

function triggerNotificationPrompt() {
    if (!localStorage.getItem('notif_prompt_shown')) {
        setTimeout(() => {
            const prompt = document.getElementById('push-soft-prompt');
            if (prompt) {
                prompt.style.display = 'flex';
                localStorage.setItem('notif_prompt_shown', 'true'); 
            }
        }, 5000);
    }
}

// ==========================================
// 🚀 UNIVERSAL WAITLIST ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (e) => {
        const waitlistBtn = e.target.closest('.xg-waitlist');
        if (!waitlistBtn) return; 

        e.preventDefault();
        const originalHtml = waitlistBtn.innerHTML;
        waitlistBtn.disabled = true;
        waitlistBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;

        const featureName = waitlistBtn.getAttribute('data-feature') || "New Exclusive Feature";
        const user = firebase.auth().currentUser;

        if (!user) {
            localStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch(`${window.BASE_URL}/system/waitlist/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid, name: user.displayName || "Learner", email: user.email, featureRequested: featureName, sourcePage: window.location.pathname })
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to join waitlist.");

            waitlistBtn.style.background = "#16a34a"; 
            waitlistBtn.style.color = "white";
            waitlistBtn.innerHTML = `<i class="fa-solid fa-check-circle"></i> Added to Waitlist`;
            alert(result.message || `Success! You are on the waitlist for ${featureName}.`);

        } catch (error) {
            alert("An error occurred. Please check your connection and try again.");
            waitlistBtn.disabled = false;
            waitlistBtn.innerHTML = originalHtml;
        }
    });
});