// Master Script for Xplainer Guru - Original Design Protected
const injectLayout = () => {
    if (document.getElementById('master-header')) return; // Prevent double injection

    const userStr = localStorage.getItem('xg_user');
    let authHTML = '';
    let drawerAuthHTML = '';
    
    if(userStr) {
        const user = JSON.parse(userStr);
        authHTML = `<a href="dashboard.html" class="u-av"><img src="${user.pic || 'https://ui-avatars.com/api/?name='+user.name+'&background=000080&color=fff'}" style="width:38px; height:38px; border-radius:50%; border:2px solid #2563eb; object-fit:cover; display:block;"></a>`;
        drawerAuthHTML = `<a href="dashboard.html" class="d-link" style="color:#2563eb; font-weight:800;">My Dashboard</a>`;
    } else {
        authHTML = `<a href="login.html" style="background:#000080; color:#fff; padding:8px 16px; border-radius:8px; text-decoration:none; font-weight:700; font-size:13px; white-space:nowrap;">Login</a>`;
        drawerAuthHTML = `<a href="login.html" class="d-link" style="color:#2563eb; font-weight:800;">Login / Sign Up</a>`;
    }

    const masterCSS = `
    <style>
        :root { --xg-blue: #000080; --xg-dark: #0f172a; --xg-highlight: #2563eb; --wa-green: #25d366; --yt-red: #ff0000; --ig-pink: #e4405f; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; padding-top: 72px; font-family: 'Manrope', sans-serif; background: #f8fafc; display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden; width: 100%; }
        
        header { background: rgba(255, 255, 255, 0.98); height: 72px; width: 100%; position: fixed; top: 0; left: 0; z-index: 9000; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(10px, 3vw, 24px); box-shadow: 0 4px 20px rgba(0,0,0,0.03); backdrop-filter: blur(10px); }
        .nav-l { display: flex; align-items: center; gap: clamp(5px, 2vw, 12px); }
        .brand { font-family: 'Poppins'; font-weight: 800; font-size: clamp(1rem, 4vw, 1.4rem); display: flex; align-items: center; gap: 8px; color: #0f172a; text-decoration: none; white-space: nowrap; }
        .brand img { height: clamp(30px, 5vw, 38px); border-radius: 50%; }
        .nav-r { display: flex; align-items: center; flex-shrink: 0; margin-right: 30px; } 

        footer { background: #0f172a; color: #94a3b8; padding: 80px 20px 40px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); }
        .ft-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 40px; }
        .ft-header { color: #fff; margin-bottom: 25px; font-weight: 700; border-left: 4px solid var(--xg-highlight); padding-left: 15px; font-family: 'Poppins'; font-size: 1.1rem; text-align: left; }
        .ft-link { display: block; margin-bottom: 14px; font-size: 14px; text-decoration: none; color: inherit; transition: 0.2s; text-align: left; }
        .credits { text-align: center; margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px; font-size: 13px; opacity: 0.8; width: 100%; }
        .credits a { color: #fff; font-weight: 700; text-decoration: none; }

        #drawer { position: fixed; top: 0; left: -320px; width: 300px; height: 100%; background: #0f172a; z-index: 10001; transition: 0.4s; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; }
        #drawer.open { left: 0 !important; }
        #drawer-mask { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; backdrop-filter: blur(3px); }
        .d-link { color: #94a3b8; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; display: block; font-family: 'Poppins'; font-weight: 600; }
        
        .d-social-footer { margin-top: auto; padding-top: 30px; display: flex; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
        .s-btn { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; text-decoration:none; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .s-btn svg { width: 22px; fill: #fff; }
        .s-btn.wa { background: var(--wa-green); } .s-btn.yt { background: var(--yt-red); } .s-btn.ig { background: var(--ig-pink); }

        #notify-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 20000; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { background: #fff; padding: 40px 30px; border-radius: 30px; max-width: 400px; width: 100%; text-align: center; position: relative; color: #0f172a; }
        .modal-input { width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 12px; margin-top: 15px; font-family: inherit; outline: none; }
    </style>`;

    const headerHTML = `
    <header id="master-header">
        <div class="nav-l">
            <button onclick="toggleDrawer()" style="background:none; border:none; cursor:pointer; display:flex; align-items:center;"><svg viewBox="0 0 24 24" width="28" height="28" stroke="#0f172a" stroke-width="2.5" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
            <a href="index.html" class="brand"><img src="logo.png">Xplainer<span style="color:var(--xg-highlight)">Guru</span></a>
        </div>
        <div class="nav-r">${authHTML}</div>
    </header>`;

    const footerHTML = `
    <footer>
        <div class="ft-grid">
            <div class="ft-col">
                <a href="index.html" class="brand" style="color:#fff; margin-bottom:20px; display:inline-block;">Xplainer<span>Guru</span></a>
                <p style="font-size:14px; opacity:0.8; line-height:1.7;">Redefining academic success through high-quality video lectures and premium handwritten notes.</p>
            </div>
            <div class="ft-col"><h4 class="ft-header">Quick Access</h4><a href="index.html" class="ft-link">Home Page</a><a href="test.html" class="ft-link">Mock Tests</a><a href="notes.html" class="ft-link">Study Notes</a></div>
            <div class="ft-col"><h4 class="ft-header">Meet Mentors</h4><a href="about.html" class="ft-link">Shiwendu Kaushal</a><div style="margin-top:25px;"><h4 class="ft-header">Meet Developer</h4><a href="about.html#foundation" class="ft-link">Ashutosh Kaushal</a></div></div>
            <div class="ft-col"><h4 class="ft-header">Contact Us</h4><a href="mailto:${CONFIG.email}" class="ft-link">Email Support</a><a href="${CONFIG.ig}" target="_blank" class="ft-link">Official Instagram</a><a href="https://wa.me/${CONFIG.waNum}" target="_blank" class="ft-link">WhatsApp Chat</a></div>
        </div>
        <div class="credits">Designed and Developed by <a href="about.html#foundation">Ashutosh Kaushal</a> | &copy; 2025</div>
    </footer>
    <div id="drawer-mask" onclick="toggleDrawer()"></div>
    <div id="drawer">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;"><span style="color:#fff; font-family:'Poppins'; font-size:1.5rem; font-weight:800;">Menu</span><button onclick="toggleDrawer()" style="color:#fff; background:none; border:none; font-size:32px;">&times;</button></div>
        <div style="flex:1;">${drawerAuthHTML}<a href="index.html" class="d-link">Home</a><a href="test.html" class="d-link">Mock Tests</a><a href="notes.html" class="d-link">Study Notes</a><a href="about.html" class="d-link">Our Team</a></div>
        <div class="d-social-footer">
            <a href="${CONFIG.waChannel}" class="s-btn wa" target="_blank"><svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.23c-1.5 0-2.98-.39-4.28-1.14l-.3-.18-3.18.83.85-3.1-.19-.3c-.82-1.3-1.26-2.82-1.26-4.34 0-4.58 3.73-8.32 8.32-8.32 4.58 0 8.32 3.73 8.32 8.32 0 4.58-3.73 8.32-8.32 8.32zm4.56-6.24c-.25-.13-1.49-.73-1.72-.82-.23-.08-.39-.13-.56.13-.17.25-.65.82-.79.98-.15.17-.3.19-.55.07-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.01-.39.11-.51.11-.11.25-.3.37-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.24 3.74 1.63.7 2.26.75 3.09.63.92-.14 1.49-.61 1.7-1.19.22-.59.22-1.09.15-1.19-.06-.1-.23-.17-.48-.3z"/></svg></a>
            <a href="${CONFIG.yt}" class="s-btn yt" target="_blank"><svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg></a>
            <a href="${CONFIG.ig}" class="s-btn ig" target="_blank"><svg viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg></a>
        </div>
    </div>
    <div id="notify-modal">
        <div class="modal-content">
            <button onclick="closeModal()" style="position:absolute; right:20px; top:15px; border:none; background:none; font-size:24px; cursor:pointer;">&times;</button>
            <h3>Get Notified</h3>
            <p style="font-size:13px; opacity:0.7;">Enter details to receive updates about new features.</p>
            <form action="https://formspree.io/f/mqaejajk" method="POST">
                <input type="email" name="email" class="modal-input" placeholder="Email Address" required>
                <input type="text" name="whatsapp" class="modal-input" placeholder="WhatsApp Number (Optional)">
                <button type="submit" class="submit-btn" style="background:var(--xg-highlight); color:#fff; border:none; width:100%; padding:14px; border-radius:12px; margin-top:20px; font-weight:800; cursor:pointer;">Keep Me Updated</button>
            </form>
        </div>
    </div>`;

    document.head.insertAdjacentHTML('beforeend', masterCSS);
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
};

// RUN INJECTION IMMEDIATELY OR ON LOAD
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLayout);
} else {
    injectLayout();
}

window.toggleDrawer = () => {
    const isOpen = document.getElementById('drawer').classList.toggle('open');
    document.getElementById('drawer-mask').style.display = isOpen ? 'block' : 'none';
};

window.openNotify = () => { document.getElementById('notify-modal').style.display = 'flex'; };
window.closeModal = () => { document.getElementById('notify-modal').style.display = 'none'; };

window.checkAuth = (action) => {
    if(!localStorage.getItem('xg_user')) {
        alert(`Please Login to ${action}`);
        window.location.href = "login.html";
    } else {
        openNotify();
    }
};