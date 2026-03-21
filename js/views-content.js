// js/views-content.js
const injectedViewsHTML = `
    <div id="student-view" style="display:none;"> </div>
    <div id="parent-view" style="display:none;"> </div>
    <div id="writer-tools" style="display:none;"> </div>
    <div id="mentor-view" style="display:none;"> </div>
    <div id="support-view" style="display:none;"> </div>
    <div id="admin-view" style="display:none;"> </div>
`;

function loadDashboardComponents() {
    const container = document.getElementById('dynamic-views-container');
    if (container) {
        container.innerHTML = injectedViewsHTML;
        console.log("✅ All Role Views Injected");
    }
}

// Execute immediately to prevent Dashboard race conditions!
loadDashboardComponents();