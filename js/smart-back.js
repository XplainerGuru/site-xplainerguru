// ==========================================
// 🔙 XPLAINER GURU: AUTO-DETECT SMART BACK BUTTON
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Check karo ki kya is page par <header> tag mojud hai?
    // Agar master.js load hua hoga, toh header pehle hi ban chuka hoga.
    const headerExists = document.querySelector('header');

    // 2. Agar header NAHI hai, tabhi ye Back Button lagao
    if (!headerExists) {
        const backBtnHTML = `
        <style>
            .xg-smart-back {
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                color: #0f172a;
                border: 1px solid #e2e8f0;
                padding: 10px 18px;
                border-radius: 50px;
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 10000;
                transition: 0.3s ease;
            }
            .xg-smart-back:hover {
                transform: translateX(-5px);
                background: #f1f5f9;
                box-shadow: 0 6px 20px rgba(0,0,0,0.12);
            }
        </style>
        
        <button onclick="smartGoBack()" class="xg-smart-back">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Go Back
        </button>
        `;

        // Body ke end mein button inject kar do
        document.body.insertAdjacentHTML('beforeend', backBtnHTML);

        // 3. Smart Go Back Logic
        window.smartGoBack = function() {
            // Agar browser history mein pichla page hamari hi website ka hai
            if (window.history.length > 1 && document.referrer.includes(window.location.hostname)) {
                window.history.back(); // 1 Step peeche jao
            } 
            // Agar direct link se aaya hai (WhatsApp/Telegram)
            else {
                window.location.href = 'index.html'; // Home page par bhej do
            }
        };
    }
});