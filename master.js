// 1. CONFIGURATION FOR GOOGLE SHEET TRACKING
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwq33obEvRjmPhOU-TDhsgrReHTXzL8RcKKey_UauwQBmHYpzeO7pmbluzZeMxd4mYQ/exec";

document.addEventListener("DOMContentLoaded", () => {
    // Prevent double injection
    if (document.getElementById('xg-injected')) return; 

    // USER AUTH LOGIC
    const userStr = localStorage.getItem('xg_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    let authHTML = '', drawerAuthHTML = '';
    if(user) {
        authHTML = `<a href="dashboard.html" title="Dashboard"><img src="${user.pic || 'https://ui-avatars.com/api/?name='+user.name+'&background=000080&color=fff'}" style="width:38px; height:38px; border-radius:50%; border:2px solid #2563eb; object-fit:cover; display:block;"></a>`;
        drawerAuthHTML = `<a href="dashboard.html" class="d-link" style="color:#2563eb; font-weight:800; border-bottom:1px solid rgba(255,255,255,0.1);">My Dashboard</a>`;
    } else {
        authHTML = `<a href="login.html" style="background:#000080; color:#fff; padding:8px 16px; border-radius:8px; text-decoration:none; font-weight:700; font-size:13px; white-space:nowrap;">Login</a>`;
        drawerAuthHTML = `<a href="login.html" class="d-link" style="color:#2563eb; font-weight:800; border-bottom:1px solid rgba(255,255,255,0.1);">Login / Sign Up</a>`;
    }

    // ORIGINAL MOBILE-FRIENDLY CSS
    const masterCSS = `
    <style>
        body { margin: 0; padding-top: 72px; font-family: 'Manrope', sans-serif; background: #f8fafc; color: #334155; display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden; }
        
        header { background: rgba(255, 255, 255, 0.98); height: 72px; width: 100%; position: fixed; top: 0; left: 0; z-index: 9000; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(15px, 4vw, 24px); box-shadow: 0 4px 20px rgba(0,0,0,0.03); backdrop-filter: blur(8px); box-sizing: border-box; }
        .nav-l { display: flex; align-items: center; gap: clamp(10px, 2vw, 20px); }
        .brand { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: clamp(1.2rem, 4vw, 1.5rem); display: flex; align-items: center; gap: 8px; color: #0f172a; text-decoration: none; letter-spacing: -0.5px; }
        .brand img { height: 38px; width: 38px; border-radius: 50%; object-fit: cover; }
        .nav-r { display: flex; align-items: center; }

        #drawer { position: fixed; top: 0; left: -320px; width: min(320px, 85vw); height: 100%; background: #0f172a; z-index: 10001; transition: cubic-bezier(0.4, 0, 0.2, 1) 0.4s; padding: 40px clamp(20px, 5vw, 40px); display: flex; flex-direction: column; box-shadow: 10px 0 30px rgba(0,0,0,0.3); box-sizing: border-box; overflow-y: auto; }
        #drawer.open { left: 0 !important; }
        #drawer-mask { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; backdrop-filter: blur(4px); }
        .d-link { color: #94a3b8; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'Poppins', sans-serif; font-weight: 600; text-decoration: none; font-size: 16px; display: block; transition: 0.3s; }
        .d-link:hover { color: #fff; padding-left: 10px; border-color: rgba(255,255,255,0.2); }

        .d-social-footer { margin-top: auto; padding-top: 30px; display: flex; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
        .s-btn { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; text-decoration:none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .s-btn svg { width: 20px; fill: #fff; }
        .s-btn.wa { background: var(--wa-green, #25d366); }
        .s-btn.yt { background: var(--yt-red, #ff0000); }
        .s-btn.ig { background: var(--ig-pink, #e4405f); }
        .s-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(255,255,255,0.1); }

        footer { background: #0f172a; color: #94a3b8; padding: 60px 20px 30px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); }
        .ft-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px; }
        .ft-header { color: #fff; margin-bottom: 25px; font-weight: 700; border-left: 4px solid #f59e0b; padding-left: 15px; font-family: 'Poppins', sans-serif; letter-spacing: 0.5px; font-size: 1.1rem; }
        .ft-link { display: block; margin-bottom: 14px; font-size: 14px; text-decoration: none; color: inherit; transition: 0.2s; }
        .ft-link:hover { color: #fff; transform: translateX(5px); }
        .credits { text-align: center; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px; font-size: 13px; font-family: 'Manrope', sans-serif; opacity: 0.8; }

        #xg-injected { display: none; }
    </style>
    <div id="xg-injected"></div>
    `;
    document.head.insertAdjacentHTML('beforeend', masterCSS);

    const headerHTML = `
    <header>
        <div class="nav-l">
            <button onclick="toggleDrawer()" style="background:none; border:none; cursor:pointer; padding:8px; display:flex; align-items:center;">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <a href="index.html" class="brand">
                <img src="logo.png" alt="X">
                Xplainer<span style="color:#2563eb">Guru</span>
            </a>
        </div>
        <div class="nav-r">
            ${authHTML}
        </div>
    </header>
    `;

    const drawerHTML = `
    <div id="drawer-mask" onclick="toggleDrawer()"></div>
    <div id="drawer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <span style="color:#fff; font-family:'Poppins', sans-serif; font-size:1.5rem; font-weight:800;">Menu</span>
            <button onclick="toggleDrawer()" style="color:#fff; background:none; border:none; font-size:32px; cursor:pointer; opacity:0.8; transition:0.2s;">&times;</button>
        </div>
        <div style="flex:1;">
            ${drawerAuthHTML}
            <a href="index.html" class="d-link">Home</a>
            <a href="test.html" class="d-link">Mock Tests</a>
            <a href="notes.html" class="d-link">Study Notes</a>
            <a href="about.html" class="d-link">Our Team</a>
        </div>
        <div class="d-social-footer">
            <a href="${CONFIG.waChannel}" class="s-btn wa" target="_blank" title="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.23c-1.5 0-2.98-.39-4.28-1.14l-.3-.18-3.18.83.85-3.1-.19-.3c-.82-1.3-1.26-2.82-1.26-4.34 0-4.58 3.73-8.32 8.32-8.32 4.58 0 8.32 3.73 8.32 8.32 0 4.58-3.73 8.32-8.32 8.32zm4.56-6.24c-.25-.13-1.49-.73-1.72-.82-.23-.08-.39-.13-.56.13-.17.25-.65.82-.79.98-.15.17-.3.19-.55.07-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.01-.39.11-.51.11-.11.25-.3.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.24 3.74 1.63.7 2.26.75 3.09.63.92-.14 1.49-.61 1.7-1.19.22-.59.22-1.09.15-1.19-.06-.1-.23-.17-.48-.3z"/></svg></a>
            <a href="${CONFIG.yt}" class="s-btn yt" target="_blank" title="YouTube"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="${CONFIG.ig}" class="s-btn ig" target="_blank" title="Instagram"><svg viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg></a>
        </div>
    </div>
    `;

    const footerHTML = `
    <footer>
        <div class="ft-grid">
            <div class="ft-col">
                <a href="index.html" class="brand" style="color:#fff; margin-bottom:20px; display:inline-block;">Xplainer<span style="color:#2563eb">Guru</span></a>
                <p style="font-size:14px; line-height:1.7; opacity:0.8;">Empowering students with accessible, high-quality education and expert guidance.</p>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Quick Access</h4>
                <a href="index.html" class="ft-link">Home Page</a>
                <a href="test.html" class="ft-link">Mock Tests</a>
                <a href="notes.html" class="ft-link">Study Notes</a>
                <a href="about.html" class="ft-link">Our Founders</a>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Legal & Policies</h4>
                <a href="privacy.html" class="ft-link">Privacy Policy</a>
                <a href="terms.html" class="ft-link">Terms of Service</a>
                <a href="refund.html" class="ft-link">Refund & Cancellation</a>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Contact Us</h4>
                <a href="mailto:${CONFIG.email}" class="ft-link">Email Support</a>
                <a href="${CONFIG.ig}" target="_blank" class="ft-link">Official Instagram</a>
                <a href="${CONFIG.waChannel}" target="_blank" class="ft-link">WhatsApp Channel</a>
            </div>
        </div>
        <div class="credits">
            Designed and Developed with ❤️ by <a href="${CONFIG.developer.ig}" target="_blank" style="color:#fff; font-weight:700; text-decoration:underline;">Ashutosh Kaushal</a> | &copy; 2026
        </div>
    </footer>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('afterbegin', drawerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});

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
    } else { 
        postData(data); 
    }
};

const postData = (data) => {
    fetch(SCRIPT_URL, { 
        method: "POST", 
        mode: 'no-cors', 
        body: JSON.stringify(data) 
    })
    .then(() => console.log("XG Sync Done"))
    .catch(e => console.log(e));
};