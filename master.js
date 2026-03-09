document.addEventListener("DOMContentLoaded", () => {
    
    // Check Auth State (Login check)
    const userStr = localStorage.getItem('xg_user');
    let authHTML = '';
    let drawerAuthHTML = '';
    
    if(userStr) {
        const user = JSON.parse(userStr);
        // User logged in hai -> Avatar dikhao
        authHTML = `<a href="dashboard.html" class="user-avatar"><img src="${user.pic || 'https://ui-avatars.com/api/?name='+user.name+'&background=0f172a&color=fff'}" alt="Profile"></a>`;
        drawerAuthHTML = `<a href="dashboard.html" style="color:#2563eb;">My Dashboard <span>&rarr;</span></a><a href="#" onclick="logoutUser()" style="color:#ef4444;">Logout <span>&rarr;</span></a>`;
    } else {
        // User login nahi hai -> Login Button dikhao
        authHTML = `<a href="login.html" class="login-btn">Login</a>`;
        drawerAuthHTML = `<a href="login.html" style="color:#2563eb;">Login / Sign Up <span>&rarr;</span></a>`;
    }

    // 1. INJECT PROFESSIONAL STYLES
    const masterCSS = `
    <style>
        :root { --xg-dark: #0f172a; --xg-blue: #000080; --xg-light: #f8fafc; }
        /* --- GLOBAL RESET --- */
        body { margin: 0; padding-top: 72px; font-family: 'Manrope', sans-serif; background: var(--xg-light); color: #334155; display: flex; flex-direction: column; min-height: 100vh; }
        
        /* --- HEADER --- */
        header { background: rgba(255, 255, 255, 0.98); height: 72px; width: 100%; position: fixed; top: 0; left: 0; z-index: 9000; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); backdrop-filter: blur(8px); box-sizing: border-box; }
        
        .nav-l { display: flex; align-items: center; gap: 20px; }
        .brand { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 1.5rem; display: flex; align-items: center; gap: 10px; color: var(--xg-dark); text-decoration: none; letter-spacing: -0.5px; }
        .brand img { height: 38px; width: 38px; border-radius: 50%; object-fit: cover; }
        
        .nav-r { display: flex; align-items: center; gap: 12px; }
        .social-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; transition: all 0.3s ease; background:#fff; text-decoration:none; }
        .social-btn svg { width: 18px; fill: var(--xg-dark); transition: fill 0.3s; }
        .social-btn:hover { transform: translateY(-3px); border-color: transparent; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .social-btn.wa:hover { background: #25d366; } .social-btn.wa:hover svg { fill: #fff; }
        .social-btn.yt:hover { background: #ff0000; } .social-btn.yt:hover svg { fill: #fff; }
        .social-btn.ig:hover { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); } .social-btn.ig:hover svg { fill: #fff; }

        /* Auth UI */
        .login-btn { background: var(--xg-blue); color: #fff; padding: 8px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; transition: 0.3s; }
        .login-btn:hover { background: var(--xg-dark); }
        .user-avatar img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--xg-blue); object-fit: cover; transition: 0.3s; }
        .user-avatar:hover img { transform: scale(1.05); }

        /* --- MENU DRAWER --- */
        #drawer { position: fixed; top: 0; left: -320px; width: 320px; height: 100%; background: var(--xg-dark); z-index: 10001; transition: cubic-bezier(0.4, 0, 0.2, 1) 0.4s; padding: 40px; display: flex; flex-direction: column; box-shadow: 10px 0 30px rgba(0,0,0,0.3); box-sizing: border-box; }
        #drawer.open { left: 0 !important; }
        #drawer-mask { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; backdrop-filter: blur(4px); }
        #drawer a { color: #94a3b8; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-family: 'Poppins', sans-serif; font-weight: 600; text-decoration: none; font-size: 16px; display: flex; justify-content: space-between; transition: 0.3s; }
        #drawer a:hover { color: #fff; padding-left: 10px; border-color: rgba(255,255,255,0.2); }

        /* --- FOOTER --- */
        footer { background: var(--xg-dark); color: #94a3b8; padding: 80px 20px 40px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); }
        .ft-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 50px; }
        .ft-header { color: #fff; margin-bottom: 25px; font-weight: 700; border-left: 4px solid var(--xg-blue); padding-left: 15px; font-family: 'Poppins', sans-serif; letter-spacing: 0.5px; font-size: 1.1rem; }
        .ft-link { display: block; margin-bottom: 14px; font-size: 14px; text-decoration: none; color: inherit; transition: 0.2s; }
        .ft-link:hover { color: #fff; transform: translateX(5px); }
        .credits { text-align: center; margin-top: 70px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px; font-size: 13px; font-family: 'Manrope', sans-serif; opacity: 0.8; }

        @media (max-width: 768px) { .nav-r { gap: 8px; } .social-btn { width: 36px; height: 36px; } .ft-grid { gap: 30px; } }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', masterCSS);

    // 2. INJECT HEADER (With Login/Avatar)
    const headerHTML = `
    <header>
        <div class="nav-l">
            <button onclick="toggleDrawer()" style="background:none; border:none; cursor:pointer; padding:8px; display:flex; align-items:center;">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--xg-dark)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <a href="index.html" class="brand">
                <img src="logo.png" alt="X">
                Xplainer<span style="color:var(--xg-blue)">Guru</span>
            </a>
        </div>
        <div class="nav-r">
            ${authHTML}
            <div style="width: 1px; height: 24px; background: #e2e8f0; margin: 0 5px;"></div>
            <a href="${CONFIG.yt}" class="social-btn yt" target="_blank"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="${CONFIG.ig}" class="social-btn ig" target="_blank"><svg viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg></a>
        </div>
    </header>
    `;

    // 3. INJECT DRAWER (With Test Page Link)
    const drawerHTML = `
    <div id="drawer-mask" onclick="toggleDrawer()"></div>
    <div id="drawer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
            <span style="color:#fff; font-weight:800; font-size:1.6rem; font-family:'Poppins',sans-serif;">Menu</span>
            <button onclick="toggleDrawer()" style="background:none; border:none; color:#fff; font-size:32px; cursor:pointer; opacity:0.8; transition:0.2s;">&times;</button>
        </div>
        ${drawerAuthHTML}
        <a href="index.html">Home <span>&rarr;</span></a>
        <a href="tests.html">Mock Tests <span>&rarr;</span></a>
        <a href="notes.html">Study Notes <span>&rarr;</span></a>
        <a href="about.html">About Team <span>&rarr;</span></a>
    </div>
    `;

    // 4. INJECT FOOTER (Professional Layout)
    const footerHTML = `
    <footer>
        <div class="ft-grid">
            <div class="ft-col">
                <a href="index.html" class="brand" style="color:#fff; margin-bottom:20px; display:inline-block;">Xplainer<span style="color:var(--xg-blue)">Guru</span></a>
                <p style="font-size:14px; line-height:1.7; opacity:0.8;">Empowering students with accessible, high-quality education and expert guidance.</p>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Quick Access</h4>
                <a href="index.html" class="ft-link">Home Page</a>
                <a href="tests.html" class="ft-link">Mock Tests</a>
                <a href="notes.html" class="ft-link">Study Notes</a>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Meet Mentors</h4>
                <a href="about.html" class="ft-link">${CONFIG.mentor.name}</a>
                <div style="margin-top:25px;">
                    <h4 class="ft-header" style="margin-bottom:15px;">Meet Developer</h4>
                    <a href="about.html#foundation" class="ft-link">${CONFIG.developer.name}</a>
                </div>
            </div>
            <div class="ft-col">
                <h4 class="ft-header">Contact Us</h4>
                <a href="mailto:${CONFIG.email}" class="ft-link">Email Support</a>
                <a href="${CONFIG.ig}" target="_blank" class="ft-link">Official Instagram</a>
                <a href="https://wa.me/${CONFIG.waNum}" target="_blank" class="ft-link">WhatsApp Chat</a>
            </div>
        </div>
        <div class="credits">
            Designed and Developed by <a href="${CONFIG.developer.ig}" target="_blank" style="color:#fff; font-weight:700; text-decoration:underline;">Ashutosh Kaushal</a> | &copy; 2026
        </div>
    </footer>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('afterbegin', drawerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});

// TOGGLE FUNCTION
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

// LOGOUT FUNCTION
window.logoutUser = function() {
    localStorage.removeItem('xg_user');
    window.location.reload();
}