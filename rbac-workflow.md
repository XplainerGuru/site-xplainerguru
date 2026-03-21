# Xplainer Guru - Architecture & RBAC Workflow

## 0. Enterprise Core Policies & Legal
* **Hierarchy & Departments:** All departments (Academic, Tech, Support) contain strictly Junior and Senior posts.
* **Email Administrative Isolation:** Backend/System Owner email is strictly `ashutoshkl1412@gmail.com` (Hidden from public). Public/Branding notifications strictly use `xplainerguru@gmail.com`.
* **Strict Privacy Protocol:** No internal team member's personal details (including Name) can be visible to Students/Parents by default.
* **Admin Visibility & Founder Veto:** Only Admins can request public visibility. The system must ask for their consent. However, the Founder possesses an absolute 'Veto Power' to override this and force-hide the Admin's details regardless of their consent.
* **Legal & Offboarding Agreement:** During onboarding, every team member must digitally sign a strict agreement. Clause: *"Members cannot abandon their role during critical operational periods where their absence causes direct harm to the company. Doing so waives their protections and subjects them to legal action by the company."*

## 1. Role Hierarchy & Permissions

* **Founder (2 Users):** Super Admin. Can access, modify, and delete everything. Superuser with a premium profile card. Unrestricted access to all roles' features. Can view any team member's full history (past roles, promotions) via ID search. Can monitor active tasks of all members. Direct announcement publishing. Requires ZERO permissions.
* **Admin (Specialized):** Manages platform operations and team escalations. This role is divided into three specializations:
  * *admin_mentor:* Manages ONLY the Mentor Pool and Academic escalations.
  * *admin_support:* Manages ONLY the Support Pool and Technical escalations.
  * *admin_global (All-Rounder):* Has access to both pools, acting as the ultimate bridge for escalations before they reach the Founder.
* **Mentor (Sr/Jr):** Can review content, interact with students.
  * *Senior Mentor (Academic Tier 2):* Solves escalated doubts. **Extra Power:** Upload videos, notes, articles, and test questions to the platform.
  * *Junior Mentor (Academic Tier 1, Age 15+):* Solves student doubts via tickets. Can request deletions from Admin. Gets feedback notifications (but not raw star ratings).
* **Writer Tiers & Strict Branding Protocol:**
  * *Student Writer (Contributor):* NOT a team member. Has all Student features + capability to create/submit Articles, Notes, and Test Content. All submissions strictly follow the 'Zero Direct Live' policy. **Branding Protocol:** Credit shows as "[Student Name] via Xplainer Guru" (Mutual popularity).
  * *Article Writer (Team Member, Age 15+):* Has advanced writing features + capability to create/submit Articles, Notes, and Test Content. All submissions strictly follow the 'Zero Direct Live' policy. **Branding Protocol:** 100% Startup Branding. Credit shows strictly as "Xplainer Guru" (No individual name).
* **Support (Sr/Jr):** Manages the Ticketing System. (Sr can close, Jr can reply).
  * *Senior Support (Support Tier 2):* Handles tickets escalated by Juniors. Can escalate to Admin. Full history logs.
  * *Junior Support (Support Tier 1, Age 15+):* Handles user issues. Must self-verify tickets before forwarding. Can view own solved/picked ticket logs.
* **Parent/Guardian:** Observer (Age 18+). Requires child's Student ID. Can view only their child's dashboard, test scores, full activity (notes, videos) & comparative performance analysis. Profile update (Photo/Name) allowed. Mobile/Email fixed at signup.
* **Student:** Learner. Can access notes, watch videos, take tests, and raise tickets. Profile update (Photo/Name) allowed. Mobile/Email fixed at signup (Support team se hi change hoga). View progress (notes, classes, articles). Raise & track tickets.

## 2. Page-by-Page Feature Map

* **`index.html` (Home):** Public access. Everyone can see the list of videos and notes.
* **`dashboard.html`:** 
    * *Student:* Sees enrolled courses, test scores, profile, progress, and ticket tracking updates.
    * *Parent/Guardian:* Sees child's activity, test scores, and comparative performance.
    * *Admin:* Sees total users, active tickets, platform stats (daily/monthly visitors), and promotion appeals.
    * *Founder:* Can search any team member's full history and monitor active tasks.
* **`notes.html`:** 
    * *Public:* Can see titles.
    * *Student:* Can read PDFs.
    * *Writer / Sr. Mentor:* Has an "Edit/Upload" button to manage content.
* **`login.html` / Registration Portal:**
    * Ek color-palette matched box hoga: “Team / Parent Portal”.
    * Age Requirements popup dikhega (Team: 15+, Parent: 18+).
    * Mandatory fields role ke hisaab se change hongi. Role selection list: Parent/Guardian, Mentor/Teacher, Student Support Team, Article Writer / Student Article Writer.

## 3. Core Workflows

* **Content Publishing & Edit Policy (Zero Direct Live):** NO WRITER (Team or Student) can publish directly. All submissions go to *Pending Mentor Verification*. **Edit Policy:** Editing an already live article instantly changes its status back to Pending Verification and requires logging a 'Solid Reason' for the edit. Any attempt to bypass this via code/inspect MUST throw a fatal System Error.
* **Ticket & Task Management Workflow:** Student raises ticket -> Single Route Tickets go to Pool/Queue -> Any free member picks it up (One-Task Limit: ek ticket/project complete kiye bina naya kaam pick nahi kar sakte) -> Assigned to Jr Support/Mentor -> Must self-verify before forwarding -> If unresolved, escalated to Sr Support/Mentor. 
  * *Note:* Ticket raise karte waqt, solve karte waqt, ya appeal bhejte waqt reason likhna mandatory hai (min 50 chars for forms). Har role ki ticket raising history, activity logs aur ticket status (Pop-up + Email confirmation) record honge.
* **Unique ID Generation:** System har user (Student, Parent, Team Member) aur ticket ke liye ek fixed format wali, trackable unique ID generate karta hai. Promotion hone par ID update hoti hai (e.g., Support ID changes to Mentor ID), par purani ID kisi aur ko dobara nahi milti.
* **Smart Notification System:** A unified Notification Bell in the top navigation will display alerts. Notifications are categorized for precise delivery:
  * *1. Global:* Announcements visible to everyone.
  * *2. Role-Specific:* Alerts targeted to a group (e.g., all Junior Mentors).
  * *3. Personal:* Notifications sent to a specific user's UID (e.g., ticket replies, promotion status).
* **Promotion/Demotion Workflow:** Every team member's dashboard features a 'Performance Meter'. Promotions/demotions follow a strict hierarchical flow:
  * *Application:* Only a higher authority can submit a 'Promotion/Demotion Application' for a subordinate.
  * *Approval Chain:* The application is routed to the next higher authority for approval (e.g., Sr. Mentor requests promotion for Jr. Mentor -> goes to Admin_Mentor -> final approval by Founder).

## 4. Current Development Status

* **Done:** Home page rendering, Basic Auth, Public Note viewing.
* **In Progress:** Student Dashboard UI, Test Engine.
* **Pending:** Ticketing System, Writer Portal.

## 5. ID Generation & Security Protocol

* **Founder IDs:** Hardcoded and immutable. Ashutosh Kaushal = `XG-F-AK`, Shiwendu Kaushal = `XG-F-SK`.
* **Role ID Format:** Format must be `XG-[ROLE]-[TIER]-[SEQUENCE]`. Example: `XG-MNT-JR-001` (Junior Mentor), `XG-SUP-SR-015` (Senior Support).
* **View-As Feature:** Founders and Admins have a 'View As' capability to experience the platform from the perspective of any lower role.
* **Data Security:** Strict anti-inspect policy. The client-side must never receive sensitive data (like UIDs or full profiles of other users) unless the requester is an Admin/Founder.

## 6. Advanced Architecture & Security Protocols

### 6.1 Role Inheritance Rule (Hierarchical Power)
Any higher authority automatically inherits **ALL** access and viewing rights of the roles below them, in addition to their own exclusive features. 
* *Example:* A Founder sees everything an Admin sees + Founder extras. An Admin sees everything a Support/Mentor sees + Admin extras.

### 6.2 Zero-Cost Custom Ticketing System (Architecture)
The platform utilizes a custom-built, zero-cost ticketing system powered by a Firebase Firestore `tickets` collection. 
* **Workflow:** Users raise tickets from the frontend ➔ Ticket is saved to Firestore ➔ Automatically routed to either the **Mentor Pool** (for Academic queries and Article approvals) or the **Support Pool** (for Tech and Account issues) based on the ticket category.
* **Internal Help Desk & Smart Routing:** The Help Desk is also available to internal team members, with categories changing dynamically based on the user's role:
  * *Students/Parents see:* Academic Doubts, Tech/Account Issues.
  * *Team Members see:* Leave Requests, Escalations, Internal Tech Support.

### 6.3 The 'Maker-Checker' Liability Approval Protocol (CRITICAL)
A strict dual-layer approval workflow is enforced for all **High-Risk** actions to protect the startup from future legal issues, student complaints, or liability.
* **Definition of High-Risk:** Any sensitive database action (e.g., Payment approvals, Batch student reassignment, Account bans, Permanent content deletion).
* **The Rule:** No role (including Admin) can directly execute a High-Risk action. They can only **'Request/Initiate'** the action, which requires attaching a mandatory reason. The action's status then becomes *Pending Founder Approval*.
* **Execution:** Only a Founder (God Mode) can review the provided reason and click **'Approve & Execute'**. This protocol securely cascades downwards across all roles for sensitive operations.

### 6.4 Strict Chain of Command (No Level Skipping)
A lower authority CANNOT escalate a ticket or request directly to a top authority (e.g., Jr cannot send to Admin).
* **The Flow:** Escalations must go one step up ONLY: `Jr -> Sr -> Admin -> Founder`. 
* **Note Requirement:** The sender must add a note specifying the ultimate destination/request if they intend for it to go higher.

### 6.5 Cross-Pool Routing (Admin Only)
Transferring any ticket or item between the Academic Pool (Mentors) and Non-Academic Pool (Support) can ONLY be executed by an Admin (`admin_mentor`, `admin_support`, or `admin_global`). 
* **Restriction:** Mentors and Support staff cannot cross-route directly.

## 7. Enterprise Fail-Safes & Automation

### 7.1 Intelligent Auto-Escalation & Role Fallback
* **Auto-Escalation:** If a ticket enters a specific pool (e.g., Junior Mentor) and the system detects NO active members in that role, the ticket automatically escalates to the next higher authority (e.g., Senior Mentor -> Admin).
* **Critical Staffing Alert:** If an entire department is empty, the ticket escalates directly to the Founder, triggering a 'Critical Staffing Alert' notification.
* **Inheritance Reinforcement:** Any higher authority can perform all tasks (Academic or Non-Academic) of the roles below them if needed.

### 7.2 Ghost Mode (Leave) & Resignation Handling
* **Leave/Absence (Ghost Mode):** When a member is on approved leave, the system treats them as 'non-existent'. No new tickets are routed to them. Upon return, their active status is reinstated.
* **Resignation/Offboarding:** If a team member leaves or is removed, the system automatically checks their active task pool and re-routes all pending tickets back into the Shared Pool. No task is ever orphaned.

### 7.3 Cross-Platform Push Notifications
* When a ticket enters a specific pool, all active members of that pool receive an automated Mobile/Web Push Notification (via Firebase Cloud Messaging) containing basic ticket details, ensuring instant awareness.

### 7.4 Universal Audit Logs (History)
* **Immutable Logging:** Every system action (ticket raised, status changed, article edited, approval granted) is logged immutably.
* **My History Tab:** Users have a 'My History' tab on their dashboard to view their own complete activity log.