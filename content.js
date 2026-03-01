// content.js - Light + Orange Draggable Overlay
let launcher = null;
let popup = null;

function isExtensionValid() {
    return chrome.runtime && !!chrome.runtime.id;
}

// --- Drag ---
function makeDraggable(el, handleSel) {
    let dragging = false, ox = 0, oy = 0;
    const h = handleSel ? el.querySelector(handleSel) : el;
    h.addEventListener('mousedown', e => {
        if (e.target.closest('button, input, .close-btn')) return;
        dragging = true;
        const r = el.getBoundingClientRect();
        ox = e.clientX - r.left; oy = e.clientY - r.top;
        el.style.transition = 'none';
        h.style.cursor = 'grabbing';
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        el.style.left = (e.clientX - ox + window.scrollX) + 'px';
        el.style.top = (e.clientY - oy + window.scrollY) + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; el.style.transition = ''; h.style.cursor = 'grab'; }
    });
}

// --- Styles ---
function injectCSS() {
    if (document.getElementById('th-styles')) return;
    const s = document.createElement('style');
    s.id = 'th-styles';
    s.textContent = `
        @keyframes thPop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes thSlide{0%{transform:translateY(6px) scale(.97);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes thSpin{to{transform:rotate(360deg)}}
        .th-launcher:hover{transform:scale(1.04)!important;box-shadow:0 6px 20px rgba(255,107,0,.3)!important}
        .th-btn:hover{background:#FFF0E6!important;border-color:#FF6B00!important;color:#FF6B00!important;transform:translateY(-1px)!important}
        .th-btn:active{transform:translateY(0)!important}
        #th-result::-webkit-scrollbar{width:3px}
        #th-result::-webkit-scrollbar-track{background:transparent}
        #th-result::-webkit-scrollbar-thumb{background:#ddd;border-radius:10px}
        #th-result::-webkit-scrollbar-thumb:hover{background:#ccc}
    `;
    document.head.appendChild(s);
}

// --- Selection ---
document.addEventListener('mouseup', e => {
    if (!isExtensionValid()) return;
    setTimeout(() => {
        if (!isExtensionValid()) return;
        try {
            const t = window.getSelection().toString().trim();
            if (t.length > 3) {
                chrome.storage.local.set({ selectedText: t }).catch(() => { });
                showLauncher(e.pageX, e.pageY, t);
            } else if (launcher && !launcher.contains(e.target)) {
                launcher.remove(); launcher = null;
            }
        } catch (_) { }
    }, 100);
});

// --- Launcher ---
function showLauncher(x, y, text) {
    if (!isExtensionValid()) return;
    if (launcher) launcher.remove();
    injectCSS();

    launcher = document.createElement('div');
    launcher.className = 'th-launcher';
    launcher.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span style="vertical-align:middle">Ask AI</span>`;
    launcher.style.cssText = `position:absolute;left:${x + 10}px;top:${y - 40}px;background:linear-gradient(135deg,#FF6B00,#FF8F3F);color:#fff;padding:8px 16px;border-radius:50px;font-family:Inter,'Segoe UI',system-ui,sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;z-index:2147483647;user-select:none;box-shadow:0 4px 14px rgba(255,107,0,.28);display:inline-flex;align-items:center;animation:thPop .25s cubic-bezier(.34,1.56,.64,1);transition:all .2s ease;letter-spacing:.3px`;
    launcher.onclick = e => { e.stopPropagation(); showPanel(x, y, text); launcher.remove(); launcher = null; };
    document.body.appendChild(launcher);
}

// --- Panel ---
function showPanel(x, y, text) {
    if (!isExtensionValid()) return;
    if (popup) popup.remove();
    injectCSS();

    const W = 340;
    let px = Math.min(x, window.innerWidth + window.scrollX - W - 20);

    popup = document.createElement('div');
    popup.style.cssText = `position:absolute;left:${px}px;top:${y + 10}px;width:${W}px;background:#FFFFFF;color:#1A1A1A;border:1px solid #EBEBEB;border-radius:16px;z-index:2147483647;font-family:Inter,'Segoe UI',system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.1),0 2px 6px rgba(0,0,0,.04);overflow:hidden;animation:thSlide .3s cubic-bezier(.34,1.56,.64,1)`;

    popup.innerHTML = `
        <div id="th-handle" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;cursor:grab;border-bottom:1px solid #F0F0F0;background:#FAFAFA">
            <div style="display:flex;align-items:center;gap:10px">
                <div style="width:30px;height:30px;background:linear-gradient(135deg,#FF6B00,#FF8F3F);border-radius:9px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(255,107,0,.2)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div>
                    <div style="font-size:13px;font-weight:800;color:#1A1A1A">TechHelp</div>
                    <div style="font-size:9.5px;color:#BBB;font-weight:500">Drag to move</div>
                </div>
            </div>
            <button class="close-btn" style="background:#F0F0F0;border:none;color:#BBB;width:28px;height:28px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .15s" onmouseenter="this.style.background='#FFEBE0';this.style.color='#FF6B00'" onmouseleave="this.style.background='#F0F0F0';this.style.color='#BBB'">✕</button>
        </div>

        <div style="padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <button class="th-btn" data-t="explain" style="grid-column:1/-1;padding:14px;cursor:pointer;background:linear-gradient(135deg,#FF6B00,#FF8F3F);color:white;border:none;border-radius:12px;font-family:inherit;font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:10px;transition:all .2s;box-shadow:0 2px 10px rgba(255,107,0,.18)">
                <div style="width:34px;height:34px;background:rgba(255,255,255,.2);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div style="text-align:left"><div>Explain</div><div style="font-size:10px;font-weight:400;opacity:.8;margin-top:1px">Simplify any concept</div></div>
            </button>

            <button class="th-btn" data-t="hint" style="padding:14px 10px;cursor:pointer;background:#FFF;color:#555;border:1px solid #EBEBEB;border-radius:12px;font-family:inherit;font-size:12px;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .2s">
                <div style="width:34px;height:34px;background:#FFF8E1;border-radius:9px;display:flex;align-items:center;justify-content:center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                </div>
                Hint
            </button>

            <button class="th-btn" data-t="approach" style="padding:14px 10px;cursor:pointer;background:#FFF;color:#555;border:1px solid #EBEBEB;border-radius:12px;font-family:inherit;font-size:12px;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .2s">
                <div style="width:34px;height:34px;background:#E8F5E9;border-radius:9px;display:flex;align-items:center;justify-content:center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                Approach
            </button>

            <button class="th-btn" data-t="grammar" style="grid-column:1/-1;padding:12px 14px;cursor:pointer;background:#FFF;color:#555;border:1px solid #EBEBEB;border-radius:12px;font-family:inherit;font-size:12px;font-weight:700;display:flex;align-items:center;gap:10px;transition:all .2s">
                <div style="width:34px;height:34px;background:#F3E5F5;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AB47BC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div style="text-align:left"><div>Polish & Correct</div><div style="font-size:10px;font-weight:400;color:#BBB;margin-top:1px">Fix grammar & clarity</div></div>
            </button>
        </div>

        <div id="th-result" style="margin:0 12px 12px;padding:12px;font-size:12.5px;line-height:1.7;max-height:200px;overflow-y:auto;color:#555;background:#FAFAFA;border-radius:10px;border:1px solid #F0F0F0;display:none"></div>
    `;

    // Close
    popup.querySelector('.close-btn').onclick = () => {
        popup.style.opacity = '0'; popup.style.transform = 'scale(.97) translateY(4px)';
        popup.style.transition = 'all .15s ease';
        setTimeout(() => popup.remove(), 150);
    };

    // Actions
    popup.querySelectorAll('.th-btn').forEach(btn => {
        btn.onclick = () => {
            if (!isExtensionValid()) return;
            const type = btn.getAttribute('data-t');
            const content = popup.querySelector('#th-result');
            content.style.display = 'block';
            content.innerHTML = `<div style="display:flex;align-items:center;gap:8px;color:#FF6B00"><div style="width:14px;height:14px;border:2.5px solid #FFD5B8;border-top-color:#FF6B00;border-radius:50%;animation:thSpin .6s linear infinite"></div><span style="font-size:11px;font-weight:600">Generating...</span></div>`;

            // Dim other buttons
            popup.querySelectorAll('.th-btn').forEach(b => b.style.opacity = '0.4');
            btn.style.opacity = '1';

            try {
                chrome.runtime.sendMessage({ action: "getAIResponse", text, type }, res => {
                    popup.querySelectorAll('.th-btn').forEach(b => b.style.opacity = '1');
                    if (chrome.runtime.lastError) {
                        content.innerHTML = `<span style="color:#FF3B30">⚠ Refresh the page.</span>`;
                        return;
                    }
                    if (res.error) {
                        content.innerHTML = `<span style="color:#FF3B30">⚠ ${res.error}</span>`;
                    } else {
                        content.innerHTML = res.result
                            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1A1A1A">$1</strong>')
                            .replace(/`(.*?)`/g, '<code style="background:#FFF0E6;padding:2px 5px;border-radius:4px;font-size:11px;color:#FF6B00">$1</code>')
                            .replace(/\n/g, '<br>');
                    }
                });
            } catch (_) {
                content.innerHTML = `<span style="color:#FF3B30">⚠ Extension error.</span>`;
            }
        };
    });

    document.body.appendChild(popup);
    makeDraggable(popup, '#th-handle');
}

// Message Hub
try {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (!isExtensionValid()) return;
        if (msg.action === "GET_SELECTION") sendResponse({ text: window.getSelection().toString().trim() });
        return true;
    });
} catch (_) { }
