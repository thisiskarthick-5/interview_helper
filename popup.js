// popup.js - Premium Dark + Gold Theme
document.addEventListener('DOMContentLoaded', async () => {
    const selDisplay = document.getElementById('selectedTextDisplay');
    const apiInput = document.getElementById('apiKeyInput');
    const resultContent = document.getElementById('resultContent');
    const resContainer = document.getElementById('resultContainer');
    const loader = document.getElementById('loader');

    async function update() {
        if (!chrome.runtime?.id) return;
        resContainer.classList.add('hidden');
        resultContent.innerText = "";

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: "GET_SELECTION" }, (res) => {
                    if (chrome.runtime.lastError) {
                        selDisplay.innerText = "Refresh the page to activate.";
                        selDisplay.style.color = "#555";
                        return;
                    }
                    if (res && res.text) {
                        selDisplay.innerText = res.text;
                        selDisplay.style.color = "#ffffff";
                        chrome.storage.local.set({ selectedText: res.text }).catch(() => { });
                    }
                });
            }
        } catch (e) { }

        const data = await chrome.storage.local.get('selectedText');
        if (data.selectedText) {
            selDisplay.innerText = data.selectedText;
            selDisplay.style.color = "#ffffff";
        }
    }

    update();

    // Navigation
    document.getElementById('refreshBtn').onclick = update;
    document.getElementById('settingsBtn').onclick = () => {
        document.getElementById('mainView').classList.add('hidden');
        document.getElementById('settingsView').classList.remove('hidden');
    };
    document.getElementById('backBtn').onclick = () => {
        document.getElementById('settingsView').classList.add('hidden');
        document.getElementById('mainView').classList.remove('hidden');
    };

    // Save API Key
    document.getElementById('saveKeyBtn').onclick = async () => {
        const key = apiInput.value.trim();
        if (!key) return alert("Please enter an API key.");
        await chrome.storage.local.set({ ai_api_key: key });
        alert("✓ Key saved successfully!");
    };

    // Load saved key
    const stored = await chrome.storage.local.get('ai_api_key');
    if (stored.ai_api_key) apiInput.value = stored.ai_api_key;

    // Copy button
    document.getElementById('copyBtn').onclick = () => {
        const text = resultContent.innerText;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copyBtn');
                const original = btn.innerHTML;
                btn.innerHTML = '<span>✓ Copied</span>';
                setTimeout(() => btn.innerHTML = original, 1500);
            });
        }
    };

    // Action buttons
    document.querySelectorAll('.action-card').forEach(btn => {
        btn.onclick = () => {
            const type = btn.dataset.type;
            const text = selDisplay.innerText;
            if (!text || text.includes("Highlight some text") || text.includes("Refresh the page")) {
                return alert("Select text on a page first!");
            }

            resContainer.classList.remove('hidden');
            resultContent.innerText = "";
            loader.classList.remove('hidden');

            // Update result title
            const titles = { explain: 'EXPLANATION', hint: 'HINT', approach: 'APPROACH', grammar: 'POLISHED' };
            document.getElementById('resultTypeTitle').innerText = titles[type] || 'RESULT';

            chrome.runtime.sendMessage({ action: "getAIResponse", text, type }, (res) => {
                loader.classList.add('hidden');
                if (chrome.runtime.lastError) {
                    resultContent.innerText = "Extension error. Refresh the page.";
                    return;
                }
                resultContent.innerText = res.error || res.result;
            });
        };
    });
});
