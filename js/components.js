// ==========================================
// js/components.js - Xplainer Guru Component Library
// ==========================================

const XGComponents = {

    getGlobalMicWidget: function () {
        return `
        <div class="dash-card" style="border-color: #fca5a5; background: #fff5f5;">
            <h3 style="color: #b91c1c; margin:0 0 15px; font-family:'Poppins'; font-size:16px; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-tower-broadcast"></i> Global Mic Status</h3>
            <div id="mic-badge" class="mic-off" style="position: absolute; top: 20px; right: 20px; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 50px; text-transform: uppercase; background:#f1f5f9; color:#64748b;">Loading...</div>
            
            <div style="margin-top: 10px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #ef4444; font-weight: 800; text-transform: uppercase;">Current Broadcast:</p>
                <p id="current-mic-msg" style="margin: 0; font-size: 14px; color: #0f172a; font-weight: 600;">No active announcements.</p>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="openMicModal()" style="flex: 2; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-microphone"></i> Go Live
                </button>
                <button onclick="turnOffMic()" style="flex: 1; background: #1e293b; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;" title="Turn Off Mic">
                    <i class="fa-solid fa-power-off"></i> OFF
                </button>
            </div>
        </div>
        `;
    },

    getBroadcastWidget: function () {
        return `
        <div class="dash-card" style="border-color: #fde68a; background: #fffbeb;">
            <h3 style="margin:0 0 10px; font-family:'Poppins'; font-size:16px; display:flex; align-items:center; gap:10px; color: #d97706;"><i class="fa-solid fa-bullhorn"></i> Targeted Broadcast</h3>
            <p style="color: #92400e; font-size: 13px; margin-bottom: 15px;">Send direct push notifications to specific departments or all students.</p>
            <button onclick="openModal('broadcast-modal')" style="background: #f59e0b; color: #0f172a; border: none; padding: 12px; border-radius: 8px; font-weight: 800; cursor: pointer; width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: auto;">
                <i class="fa-solid fa-paper-plane"></i> Open Megaphone
            </button>
        </div>
        `;
    },

    getTicketRadarWidget: function () {
        return `
        <div class="dash-card">
            <h3 style="margin:0 0 15px; font-family:'Poppins'; font-size:16px; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-satellite-dish" style="color: #2563eb;"></i> Live Ticket Radar</h3>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #334155;">Academic Pool</span>
                    <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 800;">0 Pending</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <span style="font-size: 14px; font-weight: 600; color: #334155;">Tech / Support Pool</span>
                    <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 800;">All Clear</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
                    <span style="font-size: 14px; font-weight: 800; color: #d97706;">Escalated Tasks</span>
                    <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 800;">0 Urgent</span>
                </div>
            </div>
        </div>
        `;
    },

    getContentStudioWidget: function() {
        return `
        <div class="dash-card" style="border-top: 4px solid #f59e0b; margin-bottom: 30px;">
            <h3 style="margin: 0 0 20px; font-family: 'Poppins'; color: #0f172a;"><i class="fa-solid fa-photo-film" style="color: #f59e0b;"></i> Content Studio (Uploads)</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 10px; color: #0f172a;"><i class="fa-brands fa-youtube" style="color: #ef4444;"></i> Add Video Class</h4>
                    <form onsubmit="uploadVideoContent(event)">
                        <input type="text" id="vid-title" placeholder="Video Title" class="admin-input" required>
                        <input type="url" id="vid-url" placeholder="YouTube URL" class="admin-input" required>
                        <input type="text" id="vid-subject" placeholder="Subject/Chapter" class="admin-input" required>
                        <button type="submit" class="admin-btn" style="background: #ef4444;"><i class="fa-solid fa-cloud-arrow-up"></i> Upload Video</button>
                    </form>
                </div>

                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 10px; color: #0f172a;"><i class="fa-solid fa-file-pdf" style="color: #8b5cf6;"></i> Add Study Notes</h4>
                    <form onsubmit="uploadPdfNote(event)">
                        <input type="text" id="note-title" placeholder="Notes Title" class="admin-input" required>
                        <input type="url" id="note-link" placeholder="PDF Drive/Storage Link" class="admin-input" required>
                        <input type="text" id="note-subject" placeholder="Subject/Chapter" class="admin-input" required>
                        <button type="submit" class="admin-btn" style="background: #8b5cf6;"><i class="fa-solid fa-cloud-arrow-up"></i> Upload PDF</button>
                    </form>
                </div>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 10px; color: #0f172a;"><i class="fa-solid fa-newspaper" style="color: #10b981;"></i> Publish Article</h4>
                    <form onsubmit="uploadArticleContent(event)">
                        <input type="text" id="art-title" placeholder="Article Title" class="admin-input" required>
                        <input type="text" id="art-category" placeholder="Category (e.g. Tips)" class="admin-input" required>
                        <textarea id="art-content" placeholder="Write content here..." class="admin-input" rows="3" required></textarea>
                        <button type="submit" class="admin-btn" style="background: #10b981;"><i class="fa-solid fa-cloud-arrow-up"></i> Publish</button>
                    </form>
                </div>
            </div>
        </div>`;
    },

    // 5. CBT MOCK TEST BUILDER (Firebase Connected Version)
    getMockTestWidget: function () {
        return `
        <h2 style="font-family: 'Poppins', sans-serif; color: #0f172a; margin-top: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 22px;">
            <i class="fa-solid fa-laptop-code" style="color: #db2777;"></i> CBT Mock Test Engine
        </h2>
        
        <div class="dash-card" style="margin-top: 20px; border-top: 4px solid #db2777;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3 style="margin:0; font-family:'Poppins'; font-size:18px; color:#0f172a;">Create New Mock Test</h3>
                    <p style="margin:5px 0 0; font-size:13px; color:#64748b;">Questions will be saved locally until you hit Publish.</p>
                </div>
                <div style="background: #fdf2f8; padding: 8px 15px; border-radius: 8px; border: 1px solid #fbcfe8; color: #db2777; font-weight: 800; font-size: 14px;">
                    <i class="fa-solid fa-layer-group"></i> Q. Count: <span id="q-counter">0</span>
                </div>
            </div>

            <form id="mock-test-form" onsubmit="saveMockQuestion(event, this)">
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div>
                        <label style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Test Name</label>
                        <input type="text" id="mt-title" class="admin-input test-meta" style="margin:5px 0 0;" placeholder="e.g., Class 8 History Ch 4" required>
                    </div>
                    <div>
                        <label style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Subject</label>
                        <select id="mt-subject" class="admin-input test-meta" style="margin:5px 0 0; cursor: pointer;" required>
                            <option value="Social Studies">Social Studies</option>
                            <option value="Geography">Geography</option>
                            <option value="History">History</option>
                            <option value="Civics">Civics</option>
                            <option value="Science">Science</option>
                            <option value="Maths">Mathematics</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Duration (Mins)</label>
                        <input type="number" id="mt-duration" class="admin-input test-meta" style="margin:5px 0 0;" placeholder="Blank for Practice">
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Question Text</label>
                    <textarea id="mq-text" class="admin-input q-field" placeholder="Type the question here..." rows="2" style="margin-top: 5px;" required></textarea>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: 800; color: #3b82f6; text-transform: uppercase;"><i class="fa-regular fa-image"></i> Question Image URL (Optional)</label>
                    <input type="url" id="mq-img" class="admin-input q-field" placeholder="Paste image link here" style="margin-top: 5px;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <input type="text" id="mq-opt-a" class="admin-input q-field" placeholder="Option A" required>
                    <input type="text" id="mq-opt-b" class="admin-input q-field" placeholder="Option B" required>
                    <input type="text" id="mq-opt-c" class="admin-input q-field" placeholder="Option C" required>
                    <input type="text" id="mq-opt-d" class="admin-input q-field" placeholder="Option D" required>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Correct Answer</label>
                    <select id="mq-correct" class="admin-input q-field" required style="cursor: pointer; margin-top: 5px;">
                        <option value="" disabled selected>Select Correct Option</option>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase;"><i class="fa-solid fa-language"></i> Solution (English) </label>
                        <textarea id="mq-sol-eng" class="admin-input q-field" placeholder="English Explanation..." rows="3" required style="margin-top: 5px; border-color: #bfdbfe;"></textarea>
                    </div>
                    <div>
                        <label style="font-size: 12px; font-weight: 800; color: #d97706; text-transform: uppercase;"><i class="fa-solid fa-language"></i> Solution (Hinglish)</label>
                        <textarea id="mq-sol-hin" class="admin-input q-field" placeholder="Concept ko Hinglish me samjhao..." rows="3" required style="margin-top: 5px; border-color: #fde68a;"></textarea>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: 800; color: #ef4444; text-transform: uppercase;"><i class="fa-brands fa-youtube"></i> Concept Video Timeline Link (Optional)</label>
                    <input type="url" id="mq-yt-link" class="admin-input q-field" placeholder="e.g., https://youtube.com/watch?v=VIDEO_ID&t=120" style="margin-top: 5px; border-color: #fecaca;">
                </div>

                <div style="display: flex; gap: 15px;">
                    <button type="submit" class="admin-btn" style="flex: 2; background: #db2777;"><i class="fa-solid fa-plus"></i> Save Question & Add Next</button>
                    <button type="button" onclick="publishFullTest(event)" class="admin-btn" style="flex: 1; background: #10b981;"><i class="fa-solid fa-rocket"></i> Publish Full Test</button>
                </div>
            </form>
        </div>
        `;
    },
    // ==========================================
    // WORKSPACE COMPONENTS (Team Portal)
    // ==========================================

    // 6. MY DESK WIDGET (Active Workspace - Where actions happen)
    getMyDeskWidget: function () {
        return `
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 20px; border-radius: 16px; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px; font-family: 'Poppins', sans-serif; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-desktop" style="color: #38bdf8;"></i> My Active Desk
            </h2>
            
            <div id="desk-empty-state" style="text-align: center; padding: 20px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px;">
                <i class="fa-solid fa-mug-hot" style="font-size: 30px; color: #64748b; margin-bottom: 10px;"></i>
                <p style="margin: 0; font-size: 14px; color: #94a3b8; font-family: 'Manrope';">Your desk is clear. Pick a ticket from the pool below to start working.</p>
            </div>

            <div id="desk-active-state" style="display: none; background: white; color: #0f172a; padding: 15px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px;">
                    <span style="font-size: 12px; font-weight: 800; color: #2563eb;" id="active-tkt-id">#TKT-XXXX</span>
                    <span style="font-size: 11px; font-weight: 800; color: #64748b;" id="active-tkt-time">Claimed just now</span>
                </div>
                <h4 style="margin: 0 0 5px; font-size: 16px; font-family: 'Poppins';" id="active-tkt-title">Ticket Title</h4>
                <p style="margin: 0 0 15px; font-size: 13px; color: #475569;" id="active-tkt-desc">Ticket description goes here...</p>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="alert('Opening Workspace Editor to type solution...')" style="flex: 2; background: #10b981; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-check-double"></i> Solve Ticket
                    </button>
                    <button onclick="releaseTicket()" style="flex: 1; background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;" title="Send back to Admin">
                        <i class="fa-solid fa-arrow-up-right-dots"></i> Escalate
                    </button>
                </div>
            </div>
        </div>
        `;
        
    },

   getAcademicPoolWidget: function() {
        return `
        <div class="pool-section" style="border-top: 4px solid #2563eb;">
            <div class="pool-header">
                <div>
                    <h2 style="margin:0; font-size:18px; color:#0f172a;"><i class="fa-solid fa-book-open" style="color:#2563eb;"></i> Academic Pool</h2>
                    <p style="margin:2px 0 0; font-size:12px; color:#64748b;">Subject doubts and concept queries.</p>
                </div>
                <span class="ticket-count" id="academic-count" style="background:#dbeafe; color:#2563eb;">0</span>
            </div>
            <div class="pool-body" id="academic-ticket-list">
                <div style="text-align:center; padding: 20px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching live academic doubts...</div>
            </div>
        </div>`;
    },

    getTechPoolWidget: function() {
        return `
        <div class="pool-section" style="border-top: 4px solid #8b5cf6;">
            <div class="pool-header">
                <div>
                    <h2 style="margin:0; font-size:18px; color:#0f172a;"><i class="fa-solid fa-microchip" style="color:#8b5cf6;"></i> Tech & Support Pool</h2>
                    <p style="margin:2px 0 0; font-size:12px; color:#64748b;">App issues, billing, and technical queries.</p>
                </div>
                <span class="ticket-count" id="tech-count" style="background:#ede9fe; color:#8b5cf6;">0</span>
            </div>
            <div class="pool-body" id="tech-ticket-list">
                <div style="text-align:center; padding: 20px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching live support tickets...</div>
            </div>
        </div>`;
    },
};

// Make sure injectComponent function is at the bottom of the file
function injectComponent(containerId, componentHTML) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML += componentHTML; // Note: Changed to += so we can inject multiple pools in one div if needed
}