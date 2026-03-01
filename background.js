// background.js - Multi-Provider AI Engine (Groq + Gemini)
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
  const storage = await chrome.storage.local.get("ai_api_key");
  const apiKey = storage.ai_api_key;

  if (!apiKey) {
    const err = "API Key missing. Please set it in the extension settings.";
    if (sendResponse) sendResponse({ error: err });
    if (tabId) chrome.tabs.sendMessage(tabId, { action: "showResult", error: err }).catch(() => { });
    return;
  }

  if (tabId) chrome.tabs.sendMessage(tabId, { action: "showLoading" }).catch(() => { });

  const promptText = generatePrompt(text, type);

  try {
    let result = null;
    let error = null;

    if (apiKey.startsWith("gsk_")) {
      // Groq API (OpenAI-compatible)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptText }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.choices) {
        result = data.choices[0].message.content;
      } else {
        error = data.error ? data.error.message : "Groq API Error";
      }

    } else {
      // Gemini API
      const model = "gemini-2.0-flash";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        result = data.candidates[0].content.parts[0].text;
      } else {
        error = data.error ? data.error.message : "No response from Gemini API.";
      }
    }

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
    const err = "Failed to connect to API: " + e.message;
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
