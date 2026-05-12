// ==========================================
// js/chatbot.js - "Ya Bro" Smart FAQ, Ticket & Routing Bot
// ==========================================

const XG_BOT_ID = 'xg-bot-modal';
const XG_FAB_ID = 'xg-bot-fab';
const CHAT_BODY_ID = 'xg-bot-body';

let isBotInitialized = false;

function initChatbot() {
    const modal = document.getElementById(XG_BOT_ID);
    if (!modal) return;

    // Floating Action Button (FAB) में बोट का लोगो सेट करना
    const fab = document.getElementById(XG_FAB_ID);
    if (fab) {
        fab.innerHTML = `<img src="bot-logo.png" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Bot Logo">`;
        fab.style.background = 'white'; // बैकग्राउंड को वाइट रखा ताकि लोगो साफ़ दिखे
    }

    // Chat Modal के Header में मौजूद रोबोट आइकन को नए लोगो से बदलना
    const modalHeader = modal.querySelector('header, .xg-bot-header, div:first-child');
    if (modalHeader) {
        const headerImg = modalHeader.querySelector('img');
        if (headerImg) {
            headerImg.src = "bot-logo.png";
            headerImg.style.borderRadius = "50%";
            headerImg.style.objectFit = "cover";
        }
    }

    setTimeout(() => {
        showGreeting();
    }, 500); 
}

function toggleBot() {
    const modal = document.getElementById(XG_BOT_ID);
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        document.getElementById(XG_FAB_ID).style.display = 'none';
        
        scrollToBottom();
    } else {
        minimizeBot();
    }
}

function minimizeBot() {
    document.getElementById(XG_BOT_ID).style.display = 'none';
    document.getElementById(XG_FAB_ID).style.display = 'flex';
}

function strictCloseBot() {
    document.getElementById(XG_BOT_ID).style.display = 'none';
    document.getElementById(XG_FAB_ID).style.display = 'none'; 
}

function scrollToBottom() {
    setTimeout(() => {
        const body = document.getElementById(CHAT_BODY_ID);
        body.scrollTop = body.scrollHeight;
    }, 50);
}

function addMessage(text, sender) {
    const body = document.getElementById(CHAT_BODY_ID);
    const bubble = document.createElement('div');
    
    bubble.style.marginBottom = '15px';
    bubble.style.display = 'flex';
    bubble.style.flexDirection = 'column';
    bubble.style.alignItems = sender === 'bot' ? 'flex-start' : 'flex-end';
    bubble.style.width = '100%';
    
    let contentStyle = sender === 'bot' 
        ? 'background: #ffffff; color: #1e293b; padding: 12px 16px; border-radius: 0 12px 12px 12px; font-size: 13px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 85%; word-wrap: break-word;' 
        : 'background: #3b82f6; color: #fff; padding: 12px 16px; border-radius: 12px 0 12px 12px; font-size: 13px; line-height: 1.5; box-shadow: 0 2px 5px rgba(59,130,246,0.2); max-width: 85%; word-wrap: break-word;';

    if(sender === 'bot') {
        bubble.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <img src="bot-logo.png" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;" alt="Bot Logo">
                <div style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase;">YA BRO</div>
            </div>
            <div style="${contentStyle}">${text}</div>
        `;
    } else {
        bubble.innerHTML = `<div style="${contentStyle}">${text}</div>`;
    }
    
    body.appendChild(bubble);
    scrollToBottom();
}

function addOptions(options) {
    const body = document.getElementById(CHAT_BODY_ID);
    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = '8px';
    optionsContainer.style.marginBottom = '15px';
    optionsContainer.style.width = '100%';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerHTML = opt.label;
        btn.style.cssText = 'background: white; border: 1px solid #cbd5e1; color: #3b82f6; padding: 10px 15px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; text-align: left; transition: all 0.2s; font-family: "Manrope"; box-shadow: 0 2px 4px rgba(0,0,0,0.02); width: 100%;';
        btn.onmouseover = () => { btn.style.background = '#eff6ff'; btn.style.borderColor = '#3b82f6'; };
        btn.onmouseleave = () => { btn.style.background = 'white'; btn.style.borderColor = '#cbd5e1'; };
        
        btn.onclick = () => {
            optionsContainer.style.display = 'none'; 
            addMessage(opt.label.replace(/<[^>]*>?/gm, ''), 'user'); 
            opt.action();
        };
        optionsContainer.appendChild(btn);
    });
    
    body.appendChild(optionsContainer);
    scrollToBottom();
}

function addMainMenuOptions() {
    addOptions([
        { label: "🔍 Find Study Material", action: handleMaterials },
        { label: "🎫 Raise Support Ticket", action: handleTicket },
        { label: "📝 Report Mistake / Feedback", action: handleFeedback },
        { label: "🤝 Join Team / Scribe Info", action: handleTeamInfo },
        { label: "📧 Contact Us (Email)", action: handleContactEmail },
        { label: "📱 Social Media Links", action: handleSocials }
    ]);
}

// "Anything Else?" Repeatable Menu
function showMainMenuOptions() { 
    setTimeout(() => {
        addMessage("Do you have any other questions or need more help?", 'bot');
        addOptions([
            { label: "✅ Yes, I need more help", action: addMainMenuOptions },
            { label: "❌ No, I'm good for now", action: () => { addMessage("Alright! Have a great day. Feel free to reach out if you need anything else! 🙏", 'bot'); } }
        ]);
    }, 1000);
}

// ==========================================
// FLOW 0: GREETING
// ==========================================
function showGreeting() {
    if (!isBotInitialized) {
        document.getElementById(CHAT_BODY_ID).innerHTML = ''; 
        isBotInitialized = true;
    }

    addMessage("Namaste! I am <b>Ya Bro</b>. How can I assist you today?", 'bot');
    addMainMenuOptions();
}

// ==========================================
// FLOW 1: STUDY MATERIALS
// ==========================================
function handleMaterials() {
    addMessage("What exactly are you looking for? Click below:", 'bot');
    addOptions([ // Changed to explicitly offer "Back to Main Menu"
        { label: "📚 Notes & PDFs", action: () => { addMessage("Here is the link:<br><br><a href='notes.html' style='background:#3b82f6; color:white; padding:8px 15px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:bold;'>Go to Notes</a>", 'bot'); addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]); } },
        { label: "▶️ Video Classes", action: () => { addMessage("Here is the link:<br><br><a href='videos.html' style='background:#ef4444; color:white; padding:8px 15px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:bold;'>Go to Videos</a>", 'bot'); addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]); } },
        { label: "📝 Mock Tests", action: () => { addMessage("Here is the link:<br><br><a href='tests.html' style='background:#10b981; color:white; padding:8px 15px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:bold;'>Go to Tests</a>", 'bot'); addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]); } },
        { label: "📖 Articles", action: () => { addMessage("Here is the link:<br><br><a href='articles.html' style='background:#8b5cf6; color:white; padding:8px 15px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:bold;'>Read Articles</a>", 'bot'); addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]); } },
        { label: "⬅️ Go Back", action: showMainMenuOptions } // This option already leads back to the main menu options
    ]);
}

// ==========================================
// FLOW 2: SUPPORT TICKET
// ==========================================
function handleTicket() {
    const isLogged = window.authManager && window.authManager.auth && window.authManager.auth.currentUser;
    
    if (!isLogged) {
        addMessage("Bro, you need to be logged in to raise a support ticket.", 'bot');
        addMessage("<a href='login.html' style='background:#3b82f6; color:white; padding:8px 15px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:bold;'>Login Here</a>", 'bot');
        addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]);
    } else {
        addMessage("Please describe your issue below. Our support team will get back to you ASAP.", 'bot');
        
        const body = document.getElementById(CHAT_BODY_ID);
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); width: 100%; box-sizing: border-box;';
        wrapper.className = 'bot-form';
        wrapper.innerHTML = `
            <input type="text" id="bot-ticket-subject" placeholder="Subject (e.g., Video not playing)" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; font-family: 'Manrope'; font-size: 13px; outline: none;" required>
            <textarea id="bot-ticket-desc" placeholder="Explain your problem in detail..." style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; min-height: 80px; font-family: 'Manrope'; font-size: 13px; resize: none; outline: none;" required></textarea>
            <button id="bot-ticket-btn" onclick="window.chatbotManager.submitBotTicket(this)" style="width: 100%; box-sizing: border-box; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;">Submit Ticket</button>
        `;
        body.appendChild(wrapper);
        scrollToBottom();
    }
}

async function submitBotTicket(btn) {
    const subject = document.getElementById('bot-ticket-subject').value.trim();
    const desc = document.getElementById('bot-ticket-desc').value.trim();
    const user = window.authManager?.auth?.currentUser;

    if (!subject || !desc) {
        alert('Please fill out both the Subject and Description fields.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Submitting...';
    
    try {
        const dbInstance = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
        if (!dbInstance) throw new Error("Database connection failed.");

        await dbInstance.collection('tickets').add({ 
            category: "Ya Bro Bot Support", 
            subject: subject, 
            description: desc, 
            uid: user.uid, 
            raisedByEmail: user.email || 'No Email',
            status: 'open',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        btn.parentElement.style.display = 'none';
        addMessage("✅ Ticket submitted successfully! Check your Dashboard for updates.", 'bot');
        addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]);
    } catch (error) {
        console.error(error);
        alert("Submission Failed: " + error.message);
        btn.disabled = false;
        btn.innerHTML = 'Submit Ticket';
    }
}

// ==========================================
// FLOW 3: REPORT MISTAKE / FEEDBACK
// ==========================================
function handleFeedback() {
    const user = window.authManager?.auth?.currentUser;
    addMessage("Found a mistake in our notes/tests? Or have a suggestion? Tell us below.", 'bot');
    
    const body = document.getElementById(CHAT_BODY_ID);
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); width: 100%; box-sizing: border-box;';
    wrapper.className = 'bot-form';
    const emailInput = user ? '' : `<input type="email" id="bot-feedback-email" placeholder="Your Email Address" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; font-family: 'Manrope'; font-size: 13px; outline: none;" required>`;
    
    wrapper.innerHTML = `
        ${emailInput}
        <textarea id="bot-feedback-text" placeholder="Type your feedback or report the mistake here..." style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; min-height: 80px; font-family: 'Manrope'; font-size: 13px; resize: none; outline: none;" required></textarea>
        <button id="bot-feedback-btn" onclick="window.chatbotManager.submitBotFeedback(this)" style="width: 100%; box-sizing: border-box; background: #f59e0b; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;">Send Feedback</button>
    `;
    body.appendChild(wrapper);
    scrollToBottom();
}

async function submitBotFeedback(btn) {
    const feedbackText = document.getElementById('bot-feedback-text').value.trim();
    const user = window.authManager?.auth?.currentUser || null; 
    const guestEmail = document.getElementById('bot-feedback-email')?.value.trim();
    
    if (!feedbackText) return alert('Please write something before sending.');
    if (!user && !guestEmail) return alert('Please provide your email address.');

    const finalEmail = user ? user.email : guestEmail;
    const finalUid = user ? user.uid : 'Guest';

    btn.disabled = true;
    btn.innerHTML = 'Sending...';

    try {
        const dbInstance = window.db || (typeof firebase !== 'undefined' ? firebase.firestore() : null);
        if (!dbInstance) throw new Error("Database connection failed.");

        await dbInstance.collection('feedback').add({ 
            feedback: feedbackText, 
            uid: finalUid, 
            email: finalEmail,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        btn.parentElement.style.display = 'none';
        addMessage("✅ Awesome! Your feedback has been sent to our team.", 'bot');
        addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]);
    } catch (error) {
        console.error(error);
        alert("Failed to send feedback: " + error.message);
        btn.disabled = false;
        btn.innerHTML = 'Send Feedback';
    }
}

// ==========================================
// FLOW 4: JOIN TEAM & SCRIBE INFO
// ==========================================
function handleTeamInfo() {
    let msg = `
        <b style="color: #2563eb;">1. Scribe (Student Writer):</b><br>
        Earn while you learn! Contribute notes and articles to the platform.<br>
        👉 <a href='signup.html?role=student_writer' style='color: #3b82f6; font-weight: bold;'>Apply as Student Writer</a><br><br>
        
        <b style="color: #8b5cf6;">2. Core Team Member:</b><br>
        Want to work with us officially? Apply as a Content Writer, Academic Mentor, or Tech Support.<br>
        👉 <a href='careers.html' style='color: #8b5cf6; font-weight: bold;'>Apply for Core Team</a>
    `;
    addMessage(msg, 'bot');
    addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]);
}

// ==========================================
// FLOW 5: EMAIL CONTACT
// ==========================================
function handleContactEmail() {
    const user = window.authManager?.auth?.currentUser;
    addMessage("Please type your message below. Our team will get back to you via email.", 'bot');
    
    const body = document.getElementById(CHAT_BODY_ID);
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); width: 100%; box-sizing: border-box;';
    wrapper.className = 'bot-form';
    const emailInput = user ? '' : `<input type="email" id="bot-email-sender" placeholder="Your Email Address" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; font-family: 'Manrope'; font-size: 13px; outline: none;" required>`;

    wrapper.innerHTML = `
        ${emailInput}
        <input type="text" id="bot-email-subject" placeholder="Subject of your email" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; font-family: 'Manrope'; font-size: 13px; outline: none;" required>
        <textarea id="bot-email-body" placeholder="Your message..." style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 10px; min-height: 80px; font-family: 'Manrope'; font-size: 13px; resize: none; outline: none;" required></textarea>
        <button id="bot-email-btn" onclick="window.chatbotManager.submitBotEmail(this)" style="width: 100%; box-sizing: border-box; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;">Send Email</button>
    `;
    body.appendChild(wrapper);
    scrollToBottom();
}

async function submitBotEmail(btn) {
    const subject = document.getElementById('bot-email-subject').value.trim();
    const bodyText = document.getElementById('bot-email-body').value.trim();
    const guestEmail = document.getElementById('bot-email-sender')?.value.trim();
    const user = window.authManager?.auth?.currentUser || null; 
    
    if (!subject || !bodyText) return alert('Please fill out both the Subject and Message fields.');
    if (!user && !guestEmail) return alert('Please provide your email address.');

    const finalEmail = user ? user.email : guestEmail;

    try {
        // Constructing the mailto link with encoded Subject and Body
        const mailSubject = encodeURIComponent(`[Inquiry from ${finalEmail}] ${subject}`);
        const mailBody = encodeURIComponent(`From: ${finalEmail}\n\nMessage:\n${bodyText}`);
        const mailtoUrl = `mailto:xplainerguru@gmail.com?subject=${mailSubject}&body=${mailBody}`;
        
        // Trigger the user's local email client
        window.location.href = mailtoUrl;
        
        btn.parentElement.style.display = 'none';
        addMessage("✅ Maine aapka message aapke email app mein load kar diya hai. Kripya wahan 'Send' button par click karein!", 'bot');
        addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]);
    } catch (error) {
        console.error(error);
        alert("Failed to send email: " + error.message);
        btn.disabled = false;
        btn.innerHTML = 'Send Email';
    }
}

// ==========================================
// FLOW 6: SOCIAL MEDIA
// ==========================================
function handleSocials() {
    const waLink = typeof CONFIG !== 'undefined' && CONFIG.waChannel ? CONFIG.waChannel : '#';
    const igLink = typeof CONFIG !== 'undefined' && CONFIG.ig ? CONFIG.ig : '#';
    const ytLink = typeof CONFIG !== 'undefined' && CONFIG.yt ? CONFIG.yt : '#';
    const fbLink = typeof CONFIG !== 'undefined' && CONFIG.fb ? CONFIG.fb : '#';

    let msg = `
        Connect with us on our official handles:<br><br>
        💬 <a href='${waLink}' target='_blank' style='color: #16a34a; font-weight: bold; text-decoration: none;'>WhatsApp Channel</a><br><br>
        📸 <a href='${igLink}' target='_blank' style='color: #e11d48; font-weight: bold; text-decoration: none;'>Instagram</a><br><br>
        ▶️ <a href='${ytLink}' target='_blank' style='color: #dc2626; font-weight: bold; text-decoration: none;'>YouTube</a><br><br>
        📘 <a href='${fbLink}' target='_blank' style='color: #2563eb; font-weight: bold; text-decoration: none;'>Facebook</a>
    `;
    addMessage(msg, 'bot');
    addOptions([{ label: "⬅️ Back to Main Menu", action: showMainMenuOptions }]);
}

// ==========================================
// EXPOSE TO WINDOW & BOOTSTRAP
// ==========================================
window.chatbotManager = { 
    initChatbot,
    showMainMenuOptions, // Expose this for external use if needed
    toggleBot, 
    minimizeBot, 
    strictCloseBot, 
    submitBotTicket,
    submitBotFeedback,
    submitBotEmail
};

document.addEventListener('DOMContentLoaded', () => {
    window.chatbotManager.initChatbot();
});