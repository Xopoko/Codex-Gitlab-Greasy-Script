## Codex Gitlab Greasy Script

### Summary

The **Codex Float Button Sender** userscript adds a floating “+” button to every `https://chatgpt.com/codex/*` page.
Clicking the button opens a dark-themed modal that matches ChatGPT’s palette; users can enter a *Merge Request Title*, *Branch name*, and a *message body*, then send all three fields to the configured webhook via `GM_xmlhttpRequest` (POST). No data are lost when the modal is closed—values persist until the page is reloaded.

---

## Features

* **One-click access** – unobtrusive circular button fixed to the bottom-right corner.
* **Three input fields** – MR title, branch, and free-form text.
* **Dark-mode styling** – colours pull from ChatGPT CSS custom properties such as `--main-surface-primary` so it automatically adapts to future theme tweaks.
* **Cross-origin API calls** – uses `GM_xmlhttpRequest`, bypassing browser CORS rules that normally block XMLHttpRequests in the page context.
* **Magic wand autofill** – click the wand to fetch MR title and branch based on the text field.
* **State persistence** – modal is created once and merely hidden/shown, so partially-written inputs remain intact between openings.
* **Minimal dependencies** – pure vanilla JS; only Tampermonkey (or another compatible manager) is required.

---

## Installation

1. **Install Tampermonkey** from the Chrome Web Store, Firefox Add-ons, or your browser’s extension gallery.
2. Click the *Raw* version of `script.user.js` to trigger Tampermonkey’s *“Install Userscript”* dialog.
3. Accept the defaults and save. The script now runs automatically on every matching page.

---

## Usage

1. Navigate to any page whose URL starts with `/codex/…`.
2. Hit the floating “+” button.
3. Fill in **Merge Request Title**, **Branch**, and **Text**.
4. Press **Send**.

   * On success, the modal hides and a toast confirms submission; fields are cleared **only** after a valid POST.
   * On network error, an alert shows the exception so you can retry.
---

## Customisation

### Changing the webhook

Edit the `API_URL` constant near the top of the script.

### Tweaking colours

All palette values reference CSS variables already present in ChatGPT’s UI (`--main-surface-primary`, `--text-primary`, etc.).
If OpenAI updates its theme tokens you normally don’t need to touch the script, but you can override any variable in your own stylesheet; because the script calls `var(--token-name)` everywhere, your overrides propagate instantly.

### Adding headers or auth

`GM_xmlhttpRequest` accepts the full XHR options hash, so you can inject headers like `Authorization: Bearer …` or switch to `fetch`-style async/await by wrapping the request in a `Promise`.
---

## Development notes

* Follow Tampermonkey’s `@grant` conventions—each GM\_\* function you call must appear in the script header.
* Keep the version string (`// @version`) semver-style so Tampermonkey’s auto-update mechanism works.
* For extensive styling, prefer additional CSS variables over hard-coded hex values; this aligns with modern best practices for theming.

---

## Troubleshooting / FAQ

| Problem                                               | Likely cause                                              | Fix                                                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Nothing happens when I click the button**           | Tampermonkey disabled or script not granted on the domain | Ensure the extension is enabled and `@match` covers the current URL.                                                       |
| **“Network Error” alert**                             | Webhook endpoint offline or CORS mis-config               | Confirm the URL is correct and reachable; remember GM requests bypass CORS only from user-script context.                  |
| **Modal colours look wrong in future ChatGPT themes** | Site variables renamed                                    | Inspect the page’s computed styles, then update the variable names in the script’s `GM_addStyle` block.                    |

---

## Contributing

Pull requests are welcome! Please lint with `eslint` and test in both light & dark themes before submitting. Refer to GitHub’s guidelines for userscript READMEs for formatting conventions.

---

## License

Released under the MIT License; see `LICENSE` for full text.
The MIT Licence is OSI-approved, permissive, and allows reuse in proprietary software as long as the notice is retained.

```
MIT License

Copyright (c) 2025 Xopoko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
…
```
