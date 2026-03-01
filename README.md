# AI Interview Helper

A Chrome extension that provides real-time AI-powered assistance during coding interviews and HR rounds. Select text on any webpage to receive instant explanations, hints, solution strategies, and grammar corrections.

---

## Features

- **Explain Simply** — Breaks down complex coding questions into clear, digestible language.
- **Give Hint** — Provides directional guidance without revealing the full solution.
- **Suggest Approach** — Recommends optimal algorithms, data structures, and problem-solving strategies.
- **Polish & Correct** — Improves grammar, tone, and clarity for HR and behavioral responses.
- **Multi-Provider AI** — Supports both **Groq** (Llama 3.3 70B) and **Google Gemini** (2.0 Flash) with automatic provider detection based on API key prefix.
- **On-Page Overlay** — A floating, draggable panel appears near selected text for immediate, in-context access.
- **Context Menu Integration** — Right-click any text selection to trigger AI actions directly from the browser menu.

---

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the project directory.

---

## Usage

### Configure Your API Key

1. Click the extension icon in the Chrome toolbar.
2. Open **Settings** (slider icon in the top-right corner).
3. Enter a **Groq** or **Gemini** API key and click **Save & Activate**.

| Provider | Key Prefix | Model              |
|----------|------------|---------------------|
| Groq     | `gsk_`     | Llama 3.3 70B       |
| Gemini   | `AIza`     | Gemini 2.0 Flash    |

The extension auto-detects the provider based on the key prefix. No additional configuration is required.

### On-Page Interaction

1. Highlight any text on a webpage.
2. Click the floating **Ask AI** button that appears near the selection.
3. Choose an action from the overlay panel. Results are displayed inline.
4. The panel is draggable — reposition it anywhere on the page.

### Context Menu

Right-click any selected text and choose an action from the **AI: Interview Helper** submenu.

---

## Project Structure

```
interviewhelper/
  manifest.json       Chrome extension manifest (Manifest V3)
  background.js       Service worker — API routing and request handling
  content.js          Content script — on-page overlay and text selection
  popup.html          Extension popup — main UI
  popup.css           Popup styles — light theme with orange accent
  popup.js            Popup logic — settings, actions, and result display
  icons/              Extension icons (16px, 48px, 128px)
```

---

## Tech Stack

| Layer        | Technology                          |
|--------------|--------------------------------------|
| Extension    | Chrome Manifest V3                   |
| Language     | Vanilla JavaScript (ES2020+)         |
| Styling      | CSS with custom properties           |
| AI Providers | Groq REST API, Google Gemini REST API|
| Storage      | Chrome Storage API (local)           |

---

## Security

- API keys are stored exclusively in the browser's local storage via `chrome.storage.local`.
- Keys are never transmitted to any server other than the configured AI provider.
- No analytics, telemetry, or third-party services are included.

---

## License

This project is provided as-is for educational and personal use. Use responsibly and ethically during actual interviews.
