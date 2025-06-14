// ==UserScript==
// @name         Codex Float Button Sender (Enhanced UI)
// @namespace    https://chatgpt.com/
// @version      0.20
// @description  Floating button: text + MR-title + branch (ChatGPT-styled, accessible, with toasts/shortcuts)
// @match        https://chatgpt.com/codex/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
  /* ---------------- SETTINGS ---------------- */
  const API_URL_SEND  = '';
  const API_URL_SYNC  = '';

  /* ---------------- STYLES ---------------- */
  GM_addStyle(`
    :root{
      --codex-bg-primary: var(--main-surface-primary,#343541);
      --codex-bg-secondary: var(--main-surface-secondary,#40414f);
      --codex-bg-accent: var(--composer-blue-bg,#10a37f);
      --codex-bg-accent-hover: var(--composer-blue-hover,#13b491);
      --codex-text-primary: var(--text-primary,#ececf1);
      --codex-border: var(--border-medium,#8e8ea0);
    }

    /* Floating FAB */
    #codex-fab{
      position:fixed;bottom:24px;right:24px;z-index:9999;
      width:56px;height:56px;border-radius:50%;display:grid;place-items:center;
      background:var(--codex-bg-secondary);border:2px solid var(--codex-border);
      cursor:pointer;user-select:none;
      box-shadow:0 4px 12px rgba(0,0,0,.5);transition:.25s background, .25s box-shadow, .25s transform;
    }
    #codex-fab:hover{background:var(--codex-bg-primary);box-shadow:0 6px 18px rgba(0,0,0,.8);transform:translateY(-2px)}
    #codex-fab svg{fill:var(--codex-text-primary);width:24px;height:24px}

    /* Settings FAB */
    #codex-settings-btn{position:fixed;bottom:90px;right:24px;z-index:9999;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--codex-bg-secondary);border:2px solid var(--codex-border);cursor:pointer;user-select:none;box-shadow:0 4px 12px rgba(0,0,0,.5);transition:.25s background,.25s box-shadow,.25s transform}
    #codex-settings-btn:hover{background:var(--codex-bg-primary);box-shadow:0 6px 18px rgba(0,0,0,.8);transform:translateY(-2px)}
    #codex-settings-btn svg{fill:var(--codex-text-primary);width:20px;height:20px}

    /* Overlay */
    #codex-overlay{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:.25s opacity;}
    #codex-overlay.open{opacity:1;pointer-events:auto}

    /* Settings Overlay */
    #codex-settings-overlay{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:.25s opacity;}
    #codex-settings-overlay.open{opacity:1;pointer-events:auto}

    /* Modal */
    #codex-modal{background:var(--codex-bg-primary);border-radius:12px;padding:24px 20px;width:min(92vw,520px);box-shadow:0 8px 24px rgba(0,0,0,.9);display:flex;flex-direction:column;gap:14px;position:relative;transform:scale(.96);transition:.25s transform;}
    #codex-overlay.open #codex-modal{transform:scale(1)}

    #codex-settings-modal{background:var(--codex-bg-primary);border-radius:12px;padding:24px 20px;width:min(92vw,420px);box-shadow:0 8px 24px rgba(0,0,0,.9);display:flex;flex-direction:column;gap:14px;position:relative;transform:scale(.96);transition:.25s transform;}
    #codex-settings-overlay.open #codex-settings-modal{transform:scale(1)}

    #codex-close{position:absolute;top:14px;right:14px;background:transparent;border:none;color:var(--codex-text-primary);font-size:20px;cursor:pointer;line-height:1;}
    #codex-close:hover{color:#fff}

    label.codex-field{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:var(--codex-text-primary)}
    label.codex-field input,
    label.codex-field textarea{background:var(--codex-bg-secondary);border:1px solid var(--codex-border);border-radius:6px;padding:10px 12px;font:inherit;color:var(--codex-text-primary);}
    label.codex-field input:focus,
    label.codex-field textarea:focus{outline:none;border-color:var(--codex-bg-accent);box-shadow:0 0 0 2px rgba(16,163,127,.35)}
    textarea#codex-text{height:160px;resize:vertical}

    /* Actions */
    .codex-actions{display:flex;gap:12px;margin-top:6px}
    .codex-btn{display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;border:none;cursor:pointer;padding:10px 18px;border-radius:8px;transition:.25s background;user-select:none}
    .codex-primary{background:var(--codex-bg-accent);color:#fff;flex:1}
    .codex-primary:disabled{opacity:.5;cursor:not-allowed}
    .codex-primary:hover:not(:disabled){background:var(--codex-bg-accent-hover)}
    .codex-icon-btn{background:var(--codex-bg-secondary);color:var(--codex-text-primary);width:44px}
    .codex-icon-btn:hover{background:var(--codex-bg-primary)}

    /* Loading */
    #codex-loading{position:absolute;inset:0;display:none;align-items:center;justify-content:center;border-radius:inherit;background:rgba(0,0,0,.45);}
    #codex-loading.visible{display:flex}
    #codex-loading::after{content:'';width:32px;height:32px;border-radius:50%;border:3px solid var(--codex-border);border-top-color:#fff;animation:codex-spin .8s linear infinite}
    @keyframes codex-spin{to{transform:rotate(360deg);}}

    /* Toast */
    #codex-toast{position:fixed;bottom:32px;right:32px;z-index:10000;display:none;padding:12px 18px;border-radius:8px;font-weight:600;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.5)}
    #codex-toast.success{background:var(--codex-bg-accent)}
    #codex-toast.error{background:#d93025}

    #codex-token-hint{color:#fff;font-size:12px;text-decoration:none}
    #codex-token-hint:hover{text-decoration:underline}
  `);

  /* ---------------- HELPERS ---------------- */
  const $ = sel => document.querySelector(sel);
  const showToast = (msg, type='success', ms=3000) => {
    const t = $('#codex-toast');
    t.textContent = msg; t.className = type; t.style.display='block';
    setTimeout(()=>t.style.display='none', ms);
  };

  /* ---------------- FAB ---------------- */
  const fab = document.createElement('button');
  fab.id = 'codex-fab';
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  fab.title = 'Send MR data…';
  document.body.append(fab);

  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'codex-settings-btn';
  settingsBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 009 5.6V5a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
  settingsBtn.title = 'Settings';
  document.body.append(settingsBtn);

  /* ---------------- OVERLAY/MODAL (built once) ---------------- */
  let overlay = null;
  let settingsOverlay = null;
  const buildUI = () => {
    overlay = document.createElement('div');
    overlay.id = 'codex-overlay';

    overlay.innerHTML = `
      <div id="codex-modal" role="dialog" aria-modal="true" aria-labelledby="codex-title">
        <button id="codex-close" title="Close (Esc)">×</button>
        <h2 id="codex-title" style="margin:0 0 6px;font-size:18px;color:var(--codex-text-primary);">Send Merge Request</h2>
        <label class="codex-field">Merge Request Title
          <input id="codex-title-input" type="text" placeholder="Concise but descriptive…" autocomplete="off" required />
        </label>
        <label class="codex-field">Branch Name
          <input id="codex-branch-input" type="text" placeholder="feature/my-awesome-branch" autocomplete="off" required />
        </label>
        <label class="codex-field">Description
          <textarea id="codex-text" placeholder="Enter text…"></textarea>
        </label>
        <div class="codex-actions">
          <button id="codex-send"  class="codex-btn codex-primary" disabled>Send (Ctrl+Enter)</button>
          <button id="codex-sync"  class="codex-btn codex-icon-btn" title="Sync (Ctrl+Y)">🔄</button>
        </div>
        <div id="codex-loading"></div>
      </div>`;

    document.body.append(overlay);
    // toast
    const toast = document.createElement('div');
    toast.id = 'codex-toast';
    document.body.append(toast);

    /* ----- ELEMENTS ----- */
    const titleIn  = $('#codex-title-input');
    const branchIn = $('#codex-branch-input');
    const textArea = $('#codex-text');
    const sendBtn  = $('#codex-send');
    const syncBtn  = $('#codex-sync');
    const loading  = $('#codex-loading');

    /* ----- STATE HANDLERS ----- */
    const setLoading = s => {
      loading.classList.toggle('visible', s);
      [titleIn, branchIn, textArea, sendBtn, syncBtn].forEach(el=>el.disabled=s);
    };
    const validate = () => {
      const ok = titleIn.value.trim() && branchIn.value.trim() && textArea.value.trim();
      sendBtn.disabled = !ok;
    };

    [titleIn, branchIn, textArea].forEach(el=>el.addEventListener('input', validate));

    /* ----- API CALL HELPERS ----- */
    const postJSON = (url, payload, cb) => {
      GM_xmlhttpRequest({
        method:'POST', url, headers:{'Content-Type':'application/json'}, data:JSON.stringify(payload),
        onload: resp=>cb(null,resp), onerror: err=>cb(err)
      });
    };
    const getJSON = (url, cb) => {
      GM_xmlhttpRequest({method:'GET', url, onload: resp=>cb(null,resp), onerror: err=>cb(err)});
    };


    /* ----- SEND ----- */
    const doSend = () => {
      setLoading(true);
      postJSON(API_URL_SEND,{text:textArea.value.trim(), title:titleIn.value.trim(), branch:branchIn.value.trim()}, (err,resp)=>{
        setLoading(false);
        if(err){ showToast('Network error','error'); return; }
        titleIn.value = branchIn.value = textArea.value = '';
        validate();
        close();
        showToast('Data sent!','success');
      });
    };

    /* ----- SYNC ----- */
    syncBtn.addEventListener('click', () => {
      setLoading(true);
      getJSON(API_URL_SYNC,(err,resp)=>{
        setLoading(false);
        if(err) return showToast('Sync failed','error');
        try{
          const data = JSON.parse(resp.responseText);
          showToast(data.status==='success'?'Sync success':'Sync failure', data.status==='success'?'success':'error');
        }catch(e){ showToast('Sync parse error','error'); }
      });
    });

    /* ----- SHORTCUTS ----- */
    const keyHandler = e => {
      if(e.key==='Escape'){ close(); return; }
      if(e.ctrlKey && e.key==='Enter'){ if(!sendBtn.disabled) doSend(); }
      if(e.ctrlKey && (e.key==='y'||e.key==='Y')) syncBtn.click();
    };

    /* ----- OPEN / CLOSE ----- */
    const open = () => {
      overlay.classList.add('open');
      titleIn.focus();
      document.addEventListener('keydown', keyHandler);
    };
    const close = () => {
      overlay.classList.remove('open');
      document.removeEventListener('keydown', keyHandler);
    };

    $('#codex-close').addEventListener('click', close);
    overlay.addEventListener('click', e=>{ if(e.target===overlay) close(); });
    sendBtn.addEventListener('click', doSend);

    /* ---- expose open() for FAB ---- */
    fab.addEventListener('click', open);
  };

  const buildSettingsUI = () => {
    settingsOverlay = document.createElement('div');
    settingsOverlay.id = 'codex-settings-overlay';

    settingsOverlay.innerHTML = `
      <div id="codex-settings-modal" role="dialog" aria-modal="true">
        <button id="codex-settings-close" title="Close">×</button>
        <h2 style="margin:0 0 6px;font-size:18px;color:var(--codex-text-primary);">Settings</h2>
        <label class="codex-field">Gitlab Access Token
          <input id="codex-token-input" type="text" autocomplete="off" />
        </label>
        <a id="codex-token-hint" href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html" target="_blank">How to get Access Token</a>
        <div class="codex-actions">
          <button id="codex-save-settings" class="codex-btn codex-primary">Save</button>
        </div>
      </div>`;

    document.body.append(settingsOverlay);

    const tokenInput = $('#codex-token-input');

    const open = () => {
      tokenInput.value = GM_getValue('gitlab_token','');
      settingsOverlay.classList.add('open');
      tokenInput.focus();
      document.addEventListener('keydown', keyHandler);
    };
    const close = () => {
      settingsOverlay.classList.remove('open');
      document.removeEventListener('keydown', keyHandler);
    };
    const keyHandler = e => { if(e.key==='Escape') close(); };

    $('#codex-settings-close').addEventListener('click', close);
    settingsOverlay.addEventListener('click', e=>{ if(e.target===settingsOverlay) close(); });
    $('#codex-save-settings').addEventListener('click', () => {
      GM_setValue('gitlab_token', tokenInput.value.trim());
      showToast('Settings saved','success');
      close();
    });

    settingsBtn.addEventListener('click', open);
  };

  fab.addEventListener('click', () => { if(!overlay) buildUI(); });
  settingsBtn.addEventListener('click', () => { if(!settingsOverlay) buildSettingsUI(); });
})();
