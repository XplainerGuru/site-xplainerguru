const CONFIG = {
    email: "xplainerguru@gmail.com",
    waChannel: "https://whatsapp.com/channel/0029Vb7p4QV0QeadmOIpgx36",
    ig: "https://instagram.com/xplainerguru",
    yt: "https://youtube.com/@xplainerguru",
    scriptURL: "https://script.google.com/macros/s/AKfycbwi9kCj0ALebjHcpNacSzAaRkF2ePkzcq9r5BlIIjO-y9Rbr6aXVH45aFD5Rvh2CqlX/exec",

    mentor: {
        name: "Shiwendu Kaushal",
        role: "Founder & Chief Product Officer (CPO)", 
        ig: "https://instagram.com/shiwendukaushal",
        pic: "team/shiwendu.png" 
    },
    developer: {
        name: "Ashutosh Kaushal",
        role: "Founder & Chief Executive Officer (CEO), Lead Architect", 
        bio: "The technical visionary behind Xplainer Guru. Managing platform infrastructure and digital strategy.",
        website: "https://coderkaushal.netlify.app",
        ig: "https://instagram.com/ashu7061a",
        li: "https://www.linkedin.com/in/ashutoshkaushal1412",
        pic: "team/ashutosh.jpeg" 
    }
};

const contentDatabase = [
    { id: 'b8XIktr6_k0', title: 'Class 8 History Chapter 5 | When people Rebel:1857 and After| Part 2', tag: 'History' },
    { id: 'tdmWPfjl398', title: 'Class 8 History Chapter 5 | When people Rebel:1857 and After| Part 1', tag: 'History' },
    { id: 'Up_eOk0CaaQ', title: 'Class 8 History Chapter 4 | Tribals,Dikus and The Vision of a Golden Age | Part 2', tag: 'History' },
    { id: 'Lign7Rf_v90', title: 'Class 8 History Chapter 4 | Tribals,Dikus and The Vision of a Golden Age | Part 1', tag: 'History' },
    { id: 'fl6Fzt1pp9Q', title: 'Class 8 History Chapter 3 | Ruling the Countryside | Part 2', tag: 'History' },
    { id: 'wCmDDB3iETg', title: 'Class 8 History Chapter 3 | Ruling the Countryside | Part 1', tag: 'History' },
    { id: 'Y442IBVIvoc', title: 'Trade to Territory | Part 1', tag: 'History' },
    { id: 'jppjJFBLuIE', title: 'Trade to Territory | Part 2', tag: 'History' },
    { id: 'GQhRGVIFGtA', title: 'Chapter 1 Full Explanation', tag: 'History' }
];

const studyNotes = [
    { 
        title: "Class 8 History Chapter 1: How, When and Where", // [cite: 1]
        file: "pdfs/ch1.pdf", 
        size: "PDF" 
    },
    { 
        title: "Class 8 History Chapter 2: From Trade to Territory", // [cite: 33]
        file: "pdfs/ch2.pdf", 
        size: "PDF" 
    },
    { 
        title: "Class 8 History Chapter 3: Ruling the Countryside", // [cite: 81]
        file: "pdfs/ch3.pdf", 
        size: "PDF" 
    },
    { 
        title: "Class 8 History Chapter 4: Tribals, Dikus and The Vision of a Golden Age", // [cite: 119]
        file: "pdfs/ch4.pdf", 
        size: "PDF" 
    },
    { 
        title: "Class 8 History Chapter 5: When People Rebel (1857 and After)", // [cite: 152]
        file: "pdfs/ch5.pdf", 
        size: "PDF" 
    }
];

// ==========================================
// 🎥 YOUTUBE INTEGRATION ENGINE (Fixes Error 153)
// ==========================================

/**
 * Generates a secure YouTube Embed URL with correct Origin headers
 * @param {string} videoId 
 * @returns {string}
 */
function buildSecureYouTubeUrl(videoId) {
    const params = new URLSearchParams({
        'enablejsapi': '1',
        'origin': window.location.origin, // CRITICAL: Fixes Error 153
        'rel': '0',
        'modestbranding': '1',
        'showinfo': '0',
        'autoplay': '1',
        'widget_referrer': window.location.href
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Renders the Video Gallery on the 'video' page
 */
window.initVideoGallery = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = contentDatabase.map(video => `
        <div class="video-card" onclick="window.playVideoInModal('${video.id}')">
            <div class="thumb-wrapper">
                <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}">
                <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="video-info">
                <span class="video-tag">${video.tag}</span>
                <h4>${video.title}</h4>
            </div>
        </div>
    `).join('');
};

/**
 * Plays a video in the global player container (Used on both Index & Video pages)
 */
window.playVideoInModal = function(videoId) {
    const playerFrame = document.getElementById('main-video-player');
    const playerWrapper = document.getElementById('video-modal-wrapper');

    if (playerFrame) {
        playerFrame.src = buildSecureYouTubeUrl(videoId);
        if (playerWrapper) playerWrapper.style.display = 'flex';
    } else {
        console.error("Player container not found. Ensure an iframe with id 'main-video-player' exists.");
    }
};

// Export for global use
window.videoManager = { buildSecureYouTubeUrl };