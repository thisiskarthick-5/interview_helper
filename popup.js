// popup.js - Final Stable Version
document.addEventListener('DOMContentLoaded', async () => {
    const selDisplay = document.getElementById('selectedTextDisplay');
    const apiInput = document.getElementById('apiKeyInput');
    const resultContent = document.getElementById('resultContent');
    const resContainer = document.getElementById('resultContainer');
    const loader = document.getElementById('loader');

    async function update() {
        if (!chrome.runtime?.id) return; // Added check for chrome.runtime.id
        resContainer.classList.add('hidden'); // Added from the provided code edit
        resultContent.innerText = ""; // Added from the provided code edit

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: "GET_SELECTION" }, (res) => {
                    if (chrome.runtime.lastError) {
                        selDisplay.innerText = "Error: Refresh the page."; // Modified error message and target
                        return;
                    }
                    if (res && res.text) {
                        selDisplay.innerText = res.text;
                        selDisplay.style.color = "#f8fafc"; // Added from the provided code edit
                        chrome.storage.local.set({ selectedText: res.text }).catch(() => { }); // Added .catch
                    }
                });
            }
        } catch (e) { }

        const data = await chrome.storage.local.get('selectedText');
        if (data.selectedText) selDisplay.innerText = data.selectedText;
    }

    update();

    document.getElementById('refreshBtn').onclick = update;
    document.getElementById('settingsBtn').onclick = () => {
        document.getElementById('mainView').classList.add('hidden');
        document.getElementById('settingsView').classList.remove('hidden');
    };
    document.getElementById('backBtn').onclick = () => {
        document.getElementById('settingsView').classList.add('hidden');
        document.getElementById('mainView').classList.remove('hidden');
    };

    document.getElementById('saveKeyBtn').onclick = async () => {
        const key = apiInput.value.trim();
        await chrome.storage.local.set({ openai_api_key: key });
        alert("Saved!");
    };

    const stored = await chrome.storage.local.get('openai_api_key');
    if (stored.openai_api_key) apiInput.value = stored.openai_api_key;

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.onclick = () => {
            const type = btn.dataset.type;
            const text = selDisplay.innerText;
            if (text.includes("Select some text")) return alert("Select text first!");

            resContainer.classList.remove('hidden');
            resultContent.innerText = "";
            loader.classList.remove('hidden');

            chrome.runtime.sendMessage({ action: "getAIResponse", text, type }, (res) => {
                loader.classList.add('hidden');
                if (chrome.runtime.lastError) {
                    resultContent.innerText = "Error: Refresh the page.";
                    return;
                }
                resultContent.innerText = res.error || res.result;
            });
        };
    });
});
