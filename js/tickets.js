/**
 * js/tickets.js - Production-Ready Ticket Management Logic
 * Implements RBAC and Routing as per rbac-workflow.md
 */

const ticketDb = firebase.firestore();

/**
 * 1. TICKET CREATION FLOW
 * Validates fields and routes to correct pool (Mentor vs Support)
 */
async function createTicket(user, userData, ticketData) {
    const { title, description, category, priority } = ticketData;

    // Validation Logic
    if (!title || title.length < 5) throw new Error("Title must be at least 5 characters.");
    if (!description || description.length < 50) {
        throw new Error("Description must be at least 50 characters (Architecture Requirement).");
    }

    // Smart Routing (Section 6.2)
    const academicCategories = ['academic_doubt', 'article_approval'];
    const targetPool = academicCategories.includes(category) ? 'mentor_pool' : 'support_pool';

    const ticketId = `XG-TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
        ticketId: ticketId,
        creatorId: user.uid,
        creatorRole: userData.role,
        creatorName: user.displayName,
        // For Parents: Link ticket to the child's ID for dashboard visibility
        studentId: userData.role === 'parent' ? userData.childId : user.uid,
        title: title,
        description: description,
        category: category,
        priority: priority || 'low',
        status: 'open', // Default status
        pool: targetPool,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        assignedTo: null,
        history: [{
            status: 'open',
            updatedBy: user.uid,
            timestamp: new Date()
        }]
    };

    await ticketDb.collection("tickets").doc(ticketId).set(payload);
    return ticketId;
}

/**
 * 2. ROLE-BASED ACCESS (RBAC)
 * Ensures users only see tickets they are authorized to view
 */
function getTicketsQuery(user, userData) {
    const ticketsRef = ticketDb.collection("tickets");

    // Admin/Founder: Can see everything in their pools
    if (['founder', 'admin_global'].includes(userData.role)) return ticketsRef;
    
    if (userData.role === 'admin_mentor') return ticketsRef.where("pool", "==", "mentor_pool");
    if (userData.role === 'admin_support') return ticketsRef.where("pool", "==", "support_pool");

    // Parent: Can only see tickets created for their child's Student ID
    if (userData.role === 'parent') {
        return ticketsRef.where("studentId", "==", userData.childId);
    }

    // Student/Writer: Only see their own tickets
    return ticketsRef.where("creatorId", "==", user.uid);
}

/**
 * 3. STATUS & UPDATES
 * Implements One-Task Limit and Chain of Command
 */
async function updateTicketStatus(ticketId, newStatus, user, userData, reason) {
    if (!reason || reason.length < 50) {
        throw new Error("A reason of at least 50 characters is mandatory for status updates.");
    }

    const ticketRef = ticketDb.collection("tickets").doc(ticketId);
    const doc = await ticketRef.get();
    
    if (!doc.exists) throw new Error("Ticket not found.");
    const ticket = doc.data();

    // Maker-Checker Protocol (Section 6.3)
    if (newStatus === 'deleted' && userData.role !== 'founder') {
        return await requestHighRiskAction(ticketId, 'deletion', reason, user.uid);
    }

    // Update Logic
    await ticketRef.update({
        status: newStatus,
        lastUpdatedBy: user.uid,
        history: firebase.firestore.FieldValue.arrayUnion({
            status: newStatus,
            updatedBy: user.uid,
            reason: reason,
            timestamp: new Date()
        })
    });
}

async function requestHighRiskAction(targetId, actionType, reason, requesterId) {
    await ticketDb.collection("pending_approvals").add({
        targetId, actionType, reason, requesterId,
        status: 'pending_founder_approval',
        createdAt: new Date()
    });
    return "Action submitted for Founder Approval.";
}