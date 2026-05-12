// ==========================================
// js/ticketing.js - PUBLIC Help Desk & Ticket Management
// ==========================================

function initCategories(role) {
    const helpDeskSection = document.getElementById('help-desk-section');
    const categorySelect = document.getElementById('t-category');

    if (!helpDeskSection || !categorySelect) return;

    categorySelect.innerHTML = '<option value="" disabled selected>-- Select Category --</option>'; 
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
            // 🟢 FIX: Student Writer ko ab saare normal options bhi milenge!
            categorySelect.innerHTML += `<option value="academic">Academic Doubt</option>`;
            categorySelect.innerHTML += `<option value="technical">Tech Issue</option>`;
            categorySelect.innerHTML += `<option value="MNT_ART">Article Verification Request</option>`;
            break;
        default:
            categorySelect.innerHTML += `<option value="technical">General Inquiry</option>`;
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
        const user = window.authManager.auth.currentUser;
        if (!user || !user.uid) throw new Error("User session not found.");

        const userData = window.dashboardManager?.currentUserData;

        // Determine target collection and webhook category based on ticket category
        let targetCollection;
        let webhookCategory;
        // If category is 'academic_doubt' (mapped to 'academic') or 'article_verification_request' (mapped to 'MNT_ART')
        if (categoryVal === 'academic' || categoryVal === 'MNT_ART') {
            targetCollection = 'academic_tickets';
            webhookCategory = 'academic';
        } else {
            // For any other category (technical, billing, etc.)
            targetCollection = 'support_tickets';
            webhookCategory = 'support';
        }

        const ticketPayload = {
            category: categoryVal || 'technical', subject: subject || 'No Subject', 
            description: description || 'No Description', uid: user.uid, email: userData?.email || user.email,
            // Add status and timestamp for consistency
            status: 'open', // Default status for new tickets
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save the document to the determined Firestore collection
        const db = firebase.firestore(); // Get Firestore instance
        const docRef = await db.collection(targetCollection).add(ticketPayload);
        const ticketId = docRef.id; // Get the ID of the newly created document

        // Trigger Google Apps Script Webhook for email alert (Non-blocking)
        const GOOGLE_APPS_SCRIPT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyvnS3Ie78b1FiCXntWoT5buqruMY5I71K-r0wo8sH1xVbcSN6Mhj_4TFq5j8BWA4hI/exec";
        fetch(GOOGLE_APPS_SCRIPT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            keepalive: true,
            body: JSON.stringify({
                action: "new_ticket",
                category: webhookCategory,
                subject: subject,
                description: description,
                ticketId: ticketId,
                userEmail: user.email,
                userName: userData?.name || user.displayName
            })
        }).catch(e => console.log("Silent New Ticket Email Alert Error", e));

        alert(`✅ Success! Your ticket has been submitted.\n\nTicket ID: #${ticketId}`);
        e.target.reset(); 

        if(typeof fetchMyTickets === 'function') fetchMyTickets(user.uid); // Pass UID here just in case

    } catch (error) { 
        console.error("Ticket Submission Error:", error); 
        alert("Failed to submit ticket. " + error.message); 
    } finally { 
        btn.disabled = false; 
        btn.innerHTML = originalBtnText; 
    }
}

window.addTicketReply = async function(ticketId, replyText) {
    if (!ticketId || !replyText.trim()) return;
    try {
        const user = window.authManager.auth.currentUser;
        const userData = window.dashboardManager?.currentUserData;

        const payload = {
            uid: user.uid, ticket_id: ticketId, replyText: replyText.trim(),
            senderName: userData?.name || user.displayName || "User", role: userData?.role || "student"
        };

        const response = await fetch(`${window.BASE_URL}/tickets/reply`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to add reply.');
        document.getElementById('reply-input').value = '';
        await window.openTicketChat(ticketId); 
    } catch (error) { alert("Failed to send reply. " + error.message); }
};

window.openTicketChat = async function(ticketId) {
    try {
        const response = await fetch(`${window.BASE_URL}/tickets/${ticketId}`);
        const result = await response.json();
        if (result.status !== 'success') throw new Error("Ticket not found!");

        const data = result.data;
        const user = window.authManager.auth.currentUser;

        const headerId = document.getElementById('modal-ticket-id');
        let badgeClass = data.status === 'Open' ? 'badge-open' : 'badge-progress';
        if (headerId) headerId.innerHTML = `${ticketId} <span class="${badgeClass}">${data.status}</span>`;

        const container = document.getElementById('chat-messages-container');
        container.innerHTML = '';

        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                const isCurrentUser = msg.senderId === user.uid;
                const bubbleClass = isCurrentUser ? 'bubble-sender' : 'bubble-support';
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                container.innerHTML += `<div class="chat-bubble ${bubbleClass}">${msg.text}<span class="chat-meta">${msg.senderName} • ${timeStr}</span></div>`;
            });
        }

        const replyBtn = document.querySelector('#ticket-chat-modal .btn-primary');
        if (replyBtn) replyBtn.onclick = () => window.addTicketReply(ticketId, document.getElementById('reply-input').value);

        document.getElementById('ticket-chat-modal').style.display = 'flex';
        setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
        
    } catch (error) { alert("Failed to load ticket details."); }
};

window.ticketingManager = { initCategories, submitTicket, addTicketReply, openTicketChat };
window.submitTicket = submitTicket;