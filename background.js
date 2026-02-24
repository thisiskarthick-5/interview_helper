// background.js - Final Stable Version
chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Interview Helper Ready.");

  const menus = [
    { id: "explain", title: "AI: Explain Simply" },
    { id: "hint", title: "AI: Give Hint" },
    { id: "approach", title: "AI: Possible Approach" },
    { id: "grammar", title: "AI: Improve Grammar" }
  ];

  chrome.contextMenus.removeAll(() => {
    menus.forEach(menu => {
      chrome.contextMenus.create({
        id: menu.id,
        title: menu.title,
        contexts: ["selection"]
      });
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.selectionText && tab.id) {
    handleAIRequest(info.selectionText, info.menuItemId, null, tab.id);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAIResponse") {
    handleAIRequest(request.text, request.type, (res) => {
      sendResponse(res);
    });
    return true;
  }
});

async function handleAIRequest(text, type, sendResponse, tabId = null) {
  const storage = await chrome.storage.local.get("openai_api_key");
  const apiKey = storage.openai_api_key;

  if (!apiKey) {
    const err = "API Key missing. Please set it in the extension settings.";
    if (sendResponse) sendResponse({ error: err });
    if (tabId) chrome.tabs.sendMessage(tabId, { action: "showResult", error: err }).catch(() => { });
    return;
  }

  if (tabId) chrome.tabs.sendMessage(tabId, { action: "showLoading" }).catch(() => { });

  let apiUrl = "https://api.openai.com/v1/chat/completions";
  let model = "gpt-3.5-turbo";

  if (apiKey.startsWith("gsk_")) {
    apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    model = "llama-3.3-70b-versatile";
  }

  const promptText = generatePrompt(text, type);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: promptText }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const result = data.choices ? data.choices[0].message.content : (data.error ? data.error.message : "API Error");
    const error = data.choices ? null : (data.error ? data.error.message : "Unknown error");

    if (sendResponse) sendResponse({ result, error });
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: "showResult",
        result,
        error,
        title: type.toUpperCase()
      }).catch(() => { });
    }
  } catch (e) {
    const err = "Failed to connect to API.";
    if (sendResponse) sendResponse({ error: err });
    if (tabId) chrome.tabs.sendMessage(tabId, { action: "showResult", error: err }).catch(() => { });
  }
}

function generatePrompt(text, type) {
  switch (type) {
    case "explain": return `Explain this simply: "${text}"`;
    case "hint": return `Give a hint for: "${text}"`;
    case "approach": return `What approach for: "${text}"`;
    case "grammar": return `Fix grammar: "${text}"`;
    default: return text;
  }
}
