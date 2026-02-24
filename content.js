// content.js - Restored Stable Version
let launcher = null;
let popup = null;

// Helper to check if extension is still valid
function isExtensionValid() {
    return chrome.runtime && !!chrome.runtime.id;
}

document.addEventListener('mouseup', (e) => {
    if (!isExtensionValid()) return;

    setTimeout(() => {
        if (!isExtensionValid()) return;

        try {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 3) {
                chrome.storage.local.set({ selectedText: text }).catch(() => { });
                createLauncher(e.pageX, e.pageY, text);
            } else {
                if (launcher && !launcher.contains(e.target)) {
                    launcher.remove();
                    launcher = null;
                }
            }
        } catch (err) { }
    }, 100);
});

function createLauncher(x, y, text) {
    if (!isExtensionValid()) return;
    if (launcher) launcher.remove();

    launcher = document.createElement('div');
    launcher.innerText = "✨ AI Helper";
    launcher.style.cssText = `
        position: absolute;
        left: ${x + 10}px;
        top: ${y - 40}px;
        background: #6366f1;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-family: sans-serif;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        z-index: 2147483647;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        user-select: none;
    `;

    launcher.onclick = (e) => {
        e.stopPropagation();
        showResultPopup(x, y, text);
        launcher.remove();
        launcher = null;
    };

    document.body.appendChild(launcher);
}

function showResultPopup(x, y, text) {
    if (!isExtensionValid()) return;
    if (popup) popup.remove();

    popup = document.createElement('div');
    popup.style.cssText = `
        position: absolute;
        left: ${Math.min(x, window.innerWidth - 320)}px;
        top: ${y + 10}px;
        width: 300px;
        background: #0f172a;
        color: white;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 16px;
        z-index: 2147483647;
        box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        font-family: sans-serif;
    `;

    popup.innerHTML = `
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:8px;">
            <b style="color:#818cf8">AI Helper</b>
            <span id="ai-close" style="cursor:pointer">✕</span>
        </div>
        <div id="ai-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button class="ai-act" data-t="explain" style="padding:10px;cursor:pointer;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;">Explain</button>
            <button class="ai-act" data-t="hint" style="padding:10px;cursor:pointer;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;">Hint</button>
            <button class="ai-act" data-t="approach" style="padding:10px;cursor:pointer;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;">Approach</button>
            <button class="ai-act" data-t="grammar" style="padding:10px;cursor:pointer;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;">HR</button>
        </div>
        <div id="ai-content" style="margin-top:12px;font-size:14px;line-height:1.5;max-height:200px;overflow-y:auto;color:#cbd5e1"></div>
    `;

    popup.querySelector('#ai-close').onclick = () => popup.remove();

    popup.querySelectorAll('.ai-act').forEach(btn => {
        btn.onclick = () => {
            if (!isExtensionValid()) return;
            const type = btn.getAttribute('data-t');
            const content = popup.querySelector('#ai-content');
            content.innerText = "Thinking...";

            try {
                chrome.runtime.sendMessage({ action: "getAIResponse", text, type }, (res) => {
                    if (chrome.runtime.lastError) {
                        content.innerText = "Error: Refresh the page.";
                        return;
                    }
                    content.innerText = res.error || res.result;
                });
            } catch (err) { }
        };
    });

    document.body.appendChild(popup);
}

// Global Message Hub
try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (!isExtensionValid()) return;
        if (msg.action === "GET_SELECTION") {
            sendResponse({ text: window.getSelection().toString().trim() });
        }
        return true;
    });
} catch (e) { }
