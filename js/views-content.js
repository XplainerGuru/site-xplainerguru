// js/views-content.js
const injectedViewsHTML = `
    <div id="student-view" style="display:none;"> </div>
    <div id="parent-view" style="display:none;"> </div>
    <div id="writer-tools" style="display:none;"> </div>
    <div id="creator-studio-widget" style="display:none;"> </div>
`;

function loadDashboardComponents() {
    const container = document.getElementById('dynamic-views-container');
    if (container) {
        container.innerHTML = injectedViewsHTML;
        console.log("✅ Public Role Views Injected");
    }
}
loadDashboardComponents();