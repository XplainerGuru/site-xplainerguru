// ==========================================
// js/ticketing.js - Help Desk & Ticket Management
// ==========================================

function initCategories(role) {
    const helpDeskSection = document.getElementById('help-desk-section');
    const categorySelect = document.getElementById('t-category');

    if (!helpDeskSection || !categorySelect) return;

    categorySelect.innerHTML = '<option value="" disabled selected>-- Select Category --</option>'; 
    
    if (role === 'founder') {
        helpDeskSection.style.display = 'none'; // Founders don't raise tickets
    } else {
        helpDeskSection.style.display = 'block'; 
        
        switch(role) {
            case 'student':
                categorySelect.innerHTML += `<option value="academic">Academic Doubt</option>`;
                categorySelect.innerHTML += `<option value="technical">Tech Issue</option>`;
                break;
            case 'parent':
                categorySelect.innerHTML += `<option value="MNT_PRF">Child Performance Inquiry</option>`;
                categorySelect.innerHTML += `<option value="technical">Payment/Tech Issue</option>`;
                break;
            case 'student_writer':
            case 'writer': 
                categorySelect.innerHTML += `<option value="MNT_ART">Article Verification Request</option>`;
                break;
            case 'mentor_jr':
            case 'mentor_sr':
                categorySelect.innerHTML += `<option value="ADM_ESC">Escalate to Admin</option>`;
                categorySelect.innerHTML += `<option value="ADM_LV">Leave Request (Ghost Mode)</option>`;
                break;
            case 'support_jr':
            case 'support_sr':
                categorySelect.innerHTML += `<option value="ADM_ESC">Escalate to Admin</option>`;
                categorySelect.innerHTML += `<option value="ADM_LV">Leave Request</option>`;
                categorySelect.innerHTML += `<option value="ADM_BUG">System Bug</option>`;
                break;
            case 'admin':
            case 'admin_mentor':
            case 'admin_support':
            case 'admin_global':
                categorySelect.innerHTML += `<option value="FND_HRK">High-Risk Action Approval (To Founder)</option>`;
                categorySelect.innerHTML += `<option value="FND_ESC">Critical Escalation (To Founder)</option>`;
                categorySelect.innerHTML += `<option value="FND_LV">Leave Request (To Founder)</option>`;
                break;
            default:
                categorySelect.innerHTML += `<option value="technical">General Inquiry</option>`;
        }
    }
}

async function submitTicket(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submit-ticket-btn') || e.target.querySelector('button[type="submit"]');
    if(!btn) return;
    
    const originalBtnText = btn.innerHTML;
    
    const subject = document.getElementById('t-subject').value.trim();
    const categoryVal = document.getElementById('t-category').value;
    const description = document.getElementById('t-desc').value.trim();

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error("User session not found. Please log in again.");

        const db = firebase.firestore();
        const userName = user.displayName || "User";

        // 1. SAVE TO FIREBASE
        const docRef = await db.collection('tickets').add({ 
            category: categoryVal || 'technical', 
            subject: subject || 'No Subject', 
            description: description || 'No Description', 
            uid: user.uid,
            raisedByEmail: user.email || 'No Email', 
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const ticketId = docRef.id;

        // 2. 🟢 NEW: TRIGGER APPS SCRIPT EMAILS
        const HELP_DESK_SCRIPT = "https://script.google.com/macros/s/AKfycbw7HnmqV789rjclioBMa2kwNELRkrMqECh21e3pzyqosok6Q371TNW4aiVLBb4rE0Zk/exec";
        
        const poolPayload = new URLSearchParams();
        poolPayload.append("action", "new_ticket");
        poolPayload.append("category", categoryVal);
        poolPayload.append("subject", subject);
        poolPayload.append("description", description);

        // Pehle Pool ko alert bhejenge
        fetch(HELP_DESK_SCRIPT, {
            method: 'POST',
            body: poolPayload
        }).then(res => res.json()).then(data => console.log("Pool Email Triggered:", data)).catch(err => console.error("Pool Alert Fail:", err));

        // Phir Student ko Confirmation email bhejenge
        const confirmationMessage = `Hello ${userName},\n\nWe have successfully received your support request.\n\nTicket ID: #${ticketId.substring(0,6).toUpperCase()}\nSubject: ${subject}\n\nOur team is reviewing your query and will get back to you shortly. You can track the status in your Xplainer Guru Dashboard.\n\nRegards,\nXplainer Guru Support Team`;

        const studentPayload = new URLSearchParams();
        studentPayload.append("action", "admin_direct_email");
        studentPayload.append("studentEmail", user.email);
        studentPayload.append("subject", "Ticket Received: " + subject);
        studentPayload.append("message", confirmationMessage);

        fetch(HELP_DESK_SCRIPT, {
            method: 'POST',
            body: studentPayload
        }).then(res => res.json()).then(data => console.log("Student Email Triggered:", data)).catch(err => console.error("Student Confirmation Fail:", err));

        alert(`✅ Success! Your ticket has been submitted.\n\nTicket ID: #${ticketId.substring(0,6).toUpperCase()}\nWe have also sent you a confirmation email.`);
        e.target.reset(); // Clear the form

        // Auto-refresh the ticket list on Dashboard if the function exists
        if(typeof fetchMyTickets === 'function') {
            fetchMyTickets(user.uid);
        }

    } catch (error) { 
        console.error("Ticket Submission Error:", error); 
        alert("Failed to submit ticket. " + error.message); 
    } finally { 
        btn.disabled = false; 
        btn.innerHTML = originalBtnText; 
    }
}
// ACTION 2: Create addTicketReply Function
window.addTicketReply = async function(ticketId, replyText) {
    if (!ticketId || !replyText.trim()) return;

    try {
        const db = window.authManager.db;
        const user = window.authManager.auth.currentUser;
        const userName = user.displayName || "User";
        const userRole = window.role || "student";

        let displaySenderName = userName;
        let senderData = { name: userName, role: userRole, publicVisibilityConsent: false, founderVisibilityOverride: false };
        
        const roleLower = userRole.toLowerCase();
        if (roleLower !== 'student' && roleLower !== 'parent') {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            senderData = { ...userData, role: userRole }; // Capture privacy settings
            const isFounder = roleLower === 'founder';
            const isAdmin = roleLower.startsWith('admin');
            const hasConsent = userData.publicVisibilityConsent === true;
            const founderVeto = userData.founderVisibilityOverride === true;

            if (isFounder || (isAdmin && hasConsent && !founderVeto)) {
                displaySenderName = `${userData.name || userName} | ${userRole.toUpperCase()} @ Xplainer Guru`;
            } else {
                let formattedRole = userRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                displaySenderName = `${formattedRole} @ Xplainer Guru`;
            }
        }

        await db.collection('tickets').doc(ticketId).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                senderId: user.uid,
                senderName: displaySenderName,
                senderRole: userRole,
                text: replyText.trim(),
                timestamp: new Date().toISOString()
            })
        });

        // Trigger Email Alert if a Team Member replied to the User
        const ticketDoc = await db.collection('tickets').doc(ticketId).get();
        if (ticketDoc.exists && user.uid !== ticketDoc.data().raisedByUid) {
            if (window.notificationManager && typeof window.notificationManager.sendEmailAlert === 'function') {
                window.notificationManager.sendEmailAlert(
                    ticketDoc.data().raisedByEmail,
                    `New Reply on Ticket: ${ticketId}`,
                    `A team member has replied to your ticket (${ticketId}).\n\nReply:\n"${replyText.trim()}"\n\nPlease log in to your dashboard to view the full conversation.`,
                    senderData
                );
            }
        }

        document.getElementById('reply-input').value = '';
        await window.openTicketChat(ticketId); // Refresh the UI
    } catch (error) {
        console.error("Error adding reply:", error);
        alert("Failed to send reply. " + error.message);
    }
};

// ACTION 3: Create openTicketChat Function
window.openTicketChat = async function(ticketId) {
    try {
        const db = window.authManager.db;
        const doc = await db.collection('tickets').doc(ticketId).get();
        
        if (!doc.exists) {
            alert("Ticket not found!");
            return;
        }

        const data = doc.data();
        const user = window.authManager.auth.currentUser;

        // Update Header
        const headerId = document.getElementById('modal-ticket-id');
        let badgeClass = data.status === 'Open' ? 'badge-open' : 'badge-progress';
        if (headerId) headerId.innerHTML = `${ticketId} <span class="${badgeClass}">${data.status}</span>`;

        // Generate Messages HTML
        const container = document.getElementById('chat-messages-container');
        container.innerHTML = '';

        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                const isCurrentUser = msg.senderId === user.uid;
                const bubbleClass = isCurrentUser ? 'bubble-sender' : 'bubble-support';
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                container.innerHTML += `
                    <div class="chat-bubble ${bubbleClass}">
                        ${msg.text}
                        <span class="chat-meta">${msg.senderName} • ${timeStr}</span>
                    </div>
                `;
            });
        }

        // Wire up the Send button dynamically to pass the correct ticketId
        const replyBtn = document.querySelector('#ticket-chat-modal .btn-primary');
        if (replyBtn) {
            replyBtn.onclick = () => {
                const text = document.getElementById('reply-input').value;
                window.addTicketReply(ticketId, text);
            };
        }

        // Show Modal and Auto-scroll to bottom
        document.getElementById('ticket-chat-modal').style.display = 'flex';
        setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
        
    } catch (error) {
        console.error("Error opening chat:", error);
        alert("Failed to load ticket details.");
    }
};

// Expose manager and standalone function globally
window.ticketingManager = { initCategories, submitTicket, addTicketReply, openTicketChat };
window.submitTicket = submitTicket; // Enables inline <form onsubmit="submitTicket(event)">