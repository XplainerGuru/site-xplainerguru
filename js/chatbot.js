// ==========================================
// js/chatbot.js - Global Rule-Based FAQ Bot & Deflection System
// ==========================================

const XG_BOT_ID = 'xg-bot-modal';
const XG_FAB_ID = 'xg-bot-fab';
const CHAT_BODY_ID = 'xg-bot-body';

function initChatbot() {
    setTimeout(() => {
        showGreeting();
    }, 500); // Slight delay for natural feel
}

function toggleBot() {
    const modal = document.getElementById(XG_BOT_ID);
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        document.getElementById(XG_FAB_ID).style.display = 'none';
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

function addMessage(text, sender) {
    const body = document.getElementById(CHAT_BODY_ID);
    const bubble = document.createElement('div');
    bubble.className = `bot-bubble ${sender === 'bot' ? 'bot-msg' : 'user-msg'}`;
    
    if(sender === 'bot') {
        bubble.innerHTML = `<div class="bot-avatar"><i class="fa-solid fa-robot"></i></div><div class="msg-content">${text}</div>`;
    } else {
        bubble.innerHTML = `<div class="msg-content">${text}</div>`;
    }
    
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
}

function addOptions(options) {
    const body = document.getElementById(CHAT_BODY_ID);
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'bot-options';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'bot-opt-btn';
        btn.innerText = opt.label;
        btn.onclick = () => {
            optionsContainer.remove(); // Clear choices
            addMessage(opt.label, 'user'); // Show what the user picked
            opt.action();
        };
        optionsContainer.appendChild(btn);
    });
    
    body.appendChild(optionsContainer);
    body.scrollTop = body.scrollHeight;
}

function showGreeting() {
    document.getElementById(CHAT_BODY_ID).innerHTML = ''; // Reset Chat
    addMessage("Hi! I'm the Xplainer Guru Assistant. How can I help?", 'bot');
    
    addOptions([
        { label: "📚 What is XG?", action: handleWhatIsXG },
        { label: "🎫 Raise Support Ticket", action: handleAuthGuard },
        { label: "🚀 Join Team/Parents", action: handleAuthGuard }
    ]);
}

// FLOW 1: FAQ
function handleWhatIsXG() {
    addMessage("Xplainer Guru is your Ultimate Learning Hub! We provide high-quality video classes, study notes, and an active mentor support pool.", 'bot');
    setTimeout(() => {
        addMessage("What else would you like to do?", 'bot');
        addOptions([
            { label: "🎫 Raise Support Ticket", action: handleAuthGuard },
            { label: "🚀 Join Team/Parents", action: handleAuthGuard }
        ]);
    }, 1000);
}

// FLOW 2: AUTH GUARD
function handleAuthGuard() {
    const isLogged = window.authManager && window.authManager.auth && window.authManager.auth.currentUser;
    
    if (!isLogged) {
        addMessage("This action requires an account. Would you like to Sign Up now?", 'bot');
        addOptions([
            { label: "Yes, Sign Up", action: handleSignupForm },
            { label: "No, maybe later", action: () => {
                addMessage("No problem! Let me know if you need anything else.", 'bot');
                setTimeout(showGreeting, 2000);
            }}
        ]);
    } else {
        addMessage("You are already logged in! Please use your Dashboard to access this feature directly.", 'bot');
        setTimeout(showGreeting, 2500);
    }
}

// FLOW 3: IN-CHAT FORM
function handleSignupForm() {
    addMessage("Great! Please fill out this quick form:", 'bot');
    
    const body = document.getElementById(CHAT_BODY_ID);
    const wrapper = document.createElement('div');
    wrapper.className = 'bot-form';
    wrapper.innerHTML = `
        <input type="text" id="bot-sign-name" placeholder="Full Name" required>
        <input type="email" id="bot-sign-email" placeholder="Email Address" required>
        <select id="bot-sign-role" required>
            <option value="" disabled selected>Select Role</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="team">Team Member</option>
        </select>
        <button onclick="window.chatbotManager.submitInChatForm()">Submit Application</button>
    `;
    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
}

function submitInChatForm() {
    const name = document.getElementById('bot-sign-name').value;
    const email = document.getElementById('bot-sign-email').value;
    const role = document.getElementById('bot-sign-role').value;
    
    if(!name || !email || !role) {
        alert('Please fill out all fields.');
        return;
    }
    
    alert('Signup connected to auth.js!\n\nName: ' + name + '\nEmail: ' + email + '\nRole: ' + role);
    
    // Cleanup UI
    const forms = document.querySelectorAll('.bot-form');
    forms.forEach(f => f.style.display = 'none');
    
    addMessage(`Thanks ${name}! We are preparing your ${role} application profile...`, 'bot');
    setTimeout(showGreeting, 3500);
}

// EXPOSE TO WINDOW
window.chatbotManager = { initChatbot, toggleBot, minimizeBot, strictCloseBot, submitInChatForm };

// BOOTSTRAP BOT
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotManager.initChatbot();
});