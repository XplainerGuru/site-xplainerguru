// ==========================================
// js/ticket-workflow.js - Team Pool & Desk Management (Updated)
// ==========================================

async function loadSharedPool(userRole) {
    // 1. RULE: Strict Department Isolation & Inheritance
    let poolsToLoad = [];

    // Academic Department (Jr, Sr, Admin)
    if (['mentor_jr', 'mentor_sr', 'admin_mentor'].includes(userRole)) {
        poolsToLoad.push({ id: 'MNT', ui: 'mentor-pool-list', color: '#10b981' });
    }
    // Tech/Support Department (Jr, Sr, Admin)
    else if (['support_jr', 'support_sr', 'admin_support'].includes(userRole)) {
        poolsToLoad.push({ id: 'SUP', ui: 'support-pool-list', color: '#0ea5e9' });
    }
    // God Mode (Global Admin & Founder inherits ALL powers)
    else if (['admin_global', 'admin', 'founder'].includes(userRole)) {
        poolsToLoad.push({ id: 'MNT', ui: 'mentor-pool-list', color: '#10b981' });
        poolsToLoad.push({ id: 'SUP', ui: 'support-pool-list', color: '#0ea5e9' });
    }

    if (poolsToLoad.length === 0) return; // Not a team member

    // 2. Fetch data for allowed pools
    for (const poolConfig of poolsToLoad) {
        const container = document.getElementById(poolConfig.ui);
        if (!container) continue; // Skip if HTML container is not on the screen

        container.innerHTML = `<tr><td colspan="3" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading ${poolConfig.id} pool...</td></tr>`;

        try {
            const querySnapshot = await db.collection('tickets')
                .where('pool', '==', poolConfig.id)
                .where('status', '==', 'Open')
                .where('assignedTo', '==', null)

                .get();

            if (querySnapshot.empty) {
                container.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #64748b; font-weight: 700;">No open tickets in the ${poolConfig.id} pool. Great job!</td></tr>`;
                continue;
            }

            let html = '';
            querySnapshot.forEach(doc => {
                const ticket = doc.data();
                const dateStr = ticket.timestamp ? new Date(ticket.timestamp.seconds * 1000).toLocaleDateString() : 'Just now';

                html += `
                    <tr>
                        <td>
                            <div style="font-weight: 800;">${ticket.raisedByName || 'Student'}</div>
                            <div style="font-size: 11px; color: #64748b;">${ticket.raisedByEmail || ''}</div>
                        </td>
                        <td>
                            <div style="font-weight: 700;"><span class="status-badge" style="background:#fee2e2; color:#ef4444;">${ticket.type || 'Query'}</span> ${ticket.subject}</div>
                            <div style="font-size: 11px; color: #64748b;">ID: <span class="ticket-id">${doc.id}</span> • ${dateStr}</div>
                        </td>
                        <td>
                            <button class="btn btn-claim action-btn" style="background: ${poolConfig.color};" onclick="window.workflowManager.claimTicket('${doc.id}')">
                                <i class="fa-solid fa-hand-pointer"></i> Pick Ticket
                            </button>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;

        } catch (error) {
            console.error(`Error loading ${poolConfig.id} pool:`, error);
            container.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ef4444;">Error loading data.</td></tr>`;
        }
    }
}

async function claimTicket(ticketId) {
    const user = authManager.auth.currentUser;
    if (!user) {
        alert("Session expired. Please log in.");
        return;
    }

    try {
        // ENFORCING ONE-TASK LIMIT
        const activeCheck = await db.collection('tickets')
            .where('assignedTo', '==', user.uid)
            .where('status', '==', 'In Progress')
            .get();

        if (!activeCheck.empty) {
            alert("ONE TASK LIMIT: You must resolve or escalate your active ticket before claiming a new one.");
            return;
        }

        const ticketRef = db.collection('tickets').doc(ticketId);

        await db.runTransaction(async (transaction) => {
            const ticketDoc = await transaction.get(ticketRef);
            if (!ticketDoc.exists) throw "Ticket not found.";
            if (ticketDoc.data().assignedTo) throw "Ticket was already picked by someone else.";

            transaction.update(ticketRef, {
                assignedTo: user.uid,
                assignedToName: user.displayName,
                status: 'In Progress',
                // Optional: log history array update here
            });
        });

        // Use custom UI notification if you have one instead of alert
        console.log(`Ticket ${ticketId} claimed successfully.`);

        // Refresh UI
        const userData = window.dashboardManager?.currentUserData;
        if (userData) {
            loadSharedPool(userData.role);
            loadActiveDesk(user.uid, userData.role);
        }

    } catch (error) {
        console.error("Error claiming ticket:", error);
        alert(error);
    }
}

async function loadActiveDesk(userId, userRole) {
    let containerIds = [];

    if (['mentor_jr', 'mentor_sr', 'admin_mentor'].includes(userRole)) containerIds.push('mentor-active-list');
    else if (['support_jr', 'support_sr', 'admin_support'].includes(userRole)) containerIds.push('support-active-list');
    else if (['admin_global', 'admin', 'founder'].includes(userRole)) {
        containerIds.push('mentor-active-list');
        containerIds.push('support-active-list');
    }

    if (containerIds.length === 0) return;

    for (const containerId of containerIds) {
        const container = document.getElementById(containerId);
        if (!container) continue;

        container.innerHTML = '<tr><td colspan="3" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading desk...</td></tr>';

        try {
            const querySnapshot = await db.collection('tickets')
                .where('assignedTo', '==', userId)
                .where('status', '==', 'In Progress')
                .get();

            if (querySnapshot.empty) {
                container.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #64748b; font-weight: 700;">Your active desk is empty.</td></tr>`;
                continue;
            }

            let html = '';
            querySnapshot.forEach(doc => {
                const ticket = doc.data();
                html += `
                    <tr style="background:#fff;">
                        <td><div style="font-weight: 800;">${ticket.raisedByName || 'Student'}</div></td>
                        <td>
                            <div style="font-weight: 700;">${ticket.subject}</div>
                            <div style="font-size: 11px; color: #64748b;">ID: <span class="ticket-id">${doc.id}</span></div>
                        </td>
                        <td>
                            <button class="action-btn btn-resolve" onclick="alert('Resolve flow coming next!')">Resolve</button>
                            <button class="action-btn btn-req-del" onclick="alert('Escalate flow coming next!')">Escalate</button>
                        </td>
                    </tr>
                `;
            });
            container.innerHTML = html;

        } catch (error) {
            console.error("Error loading active desk:", error);
            container.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ef4444;">Error loading desk.</td></tr>`;
        }
    }
}

window.workflowManager = {
    loadSharedPool,
    claimTicket,
    loadActiveDesk
};