// ==UserScript==
// @name         Codex Float Button Sender
// @namespace    https://chatgpt.com/
// @version      0.10
// @description  Floating button: text + MR-title + branch (automatically styled like ChatGPT)
// @match        https://chatgpt.com/codex/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
  /* --- SETTINGS --- */
  const API_URL = 'https://example.com';

  /* --- STYLES based on ChatGPT design tokens --- */
  GM_addStyle(`
    /* Floating button */
    #codex-float-btn{
      position:fixed;bottom:24px;right:24px;z-index:9999;
      width:56px;height:56px;border-radius:50%;
      background:var(--main-surface-secondary,#343541);
      border:2px solid var(--border-medium,#8e8ea0);
      cursor:pointer;
      box-shadow:0 4px 12px rgba(0,0,0,.5);
      transition:background .25s,box-shadow .25s;
    }
    #codex-float-btn:hover{
      background:var(--surface-hover,#40414f);
      box-shadow:0 6px 18px rgba(0,0,0,.8);
    }
    #codex-float-btn::before,#codex-float-btn::after{
      content:'';position:absolute;left:50%;top:50%;
      background:var(--text-primary,#fff);
      transform:translate(-50%,-50%);
    }
    #codex-float-btn::before{width:22px;height:2px;}
    #codex-float-btn::after {width:2px;height:22px;}

    /* Overlay and modal */
    #codex-modal-overlay{
      position:fixed;inset:0;z-index:9998;
      background:rgba(0,0,0,.6);
      display:flex;align-items:center;justify-content:center;
    }
    #codex-modal{
      background:var(--main-surface-primary,#343541);
      border-radius:12px;padding:20px;
      width:min(90vw,520px);
      box-shadow:0 8px 24px rgba(0,0,0,.9);
      display:flex;flex-direction:column;gap:12px;
      color:var(--text-primary,#ececf1);font-size:14px;
    }

    /* Inputs */
    #codex-modal input,
    #codex-modal textarea{
      width:100%;padding:8px;
      background:var(--main-surface-secondary,#40414f);
      color:var(--text-primary,#fff);
      border:1px solid var(--border-medium,#555);
      border-radius:6px;font:inherit;
    }
    #codex-modal textarea{height:160px;resize:vertical;}

    /* Actions */
    #codex-modal .codex-actions{
      display:flex;justify-content:space-between;gap:12px;margin-top:12px;
    }
    #codex-modal button{
      background:var(--composer-blue-bg,#10a37f);
      color:#fff;border:none;padding:8px 18px;
      border-radius:8px;font-weight:600;cursor:pointer;
      transition:background .25s;
    }
    #codex-modal button:hover{
      background:var(--composer-blue-hover,#13b491);
    }
    #codex-modal button.magic-btn{
      padding:8px;width:40px;flex-shrink:0;
    }
    #codex-modal button.send-btn{flex-grow:1;}
  `);

  /* --- Create the button --- */
  const btn = document.createElement('button');
  btn.id = 'codex-float-btn';
  btn.title = 'Send data…';
  document.body.appendChild(btn);

  /* --- A single overlay/modal kept hidden until first open --- */
  let overlay = null;

  const buildModal = () => {
    overlay = document.createElement('div');
    overlay.id = 'codex-modal-overlay';
    overlay.style.display = 'none';
    const modal = document.createElement('div');
    modal.id = 'codex-modal';

    const titleInput  = Object.assign(document.createElement('input'), { placeholder:'Merge Request Title…' });
    const branchInput = Object.assign(document.createElement('input'), { placeholder:'Branch name…' });
    const textarea    = Object.assign(document.createElement('textarea'), { placeholder:'Enter text…' });

    const magicBtn = document.createElement('button');
    magicBtn.className = 'magic-btn';
    magicBtn.textContent = '🪄';
    magicBtn.title = 'Auto-fill';

    magicBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) return alert('Text field is empty.');

      console.log('POST request:', { url: API_URL, text });

      GM_xmlhttpRequest({
        method: 'POST',
        url: API_URL,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ text }),
        onload: (resp) => {
          console.log('POST response:', resp);
          try {
            const data = JSON.parse(resp.responseText);
            const obj = Array.isArray(data) ? data[0] : data;
            const out = obj && (obj.output || obj);
            if (out && out.title) titleInput.value = out.title;
            if (out && out.branch) branchInput.value = out.branch;
          } catch (e) {
            console.error(e); alert('Error parsing response.');
          }
        },
        onerror: (err) => { console.error(err); alert('Error while fetching.'); }
      });
    });

    const sendBtn = document.createElement('button');
    sendBtn.className = 'send-btn';
    sendBtn.textContent = 'Send';

    /* --- Sending --- */
    sendBtn.addEventListener('click', () => {
      const text   = textarea.value.trim();
      const title  = titleInput.value.trim();
      const branch = branchInput.value.trim();
      if (!text || !title || !branch) return alert('Please fill in all fields.');

      console.log('POST request:', { url: API_URL, data: { text, title, branch } });

      GM_xmlhttpRequest({
        method: 'POST',
        url: API_URL,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ text, title, branch }),
        onload: (resp) => {
          console.log('POST response:', resp);
          textarea.value = titleInput.value = branchInput.value = '';
          overlay.style.display = 'none';
          alert('Data sent!');
        },
        onerror: (err) => { console.error(err); alert('Error while sending.'); }
      });
    });

    /* --- Close (but do not remove) to preserve data --- */
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    const actions = document.createElement('div');
    actions.className = 'codex-actions';
    actions.append(magicBtn, sendBtn);

    modal.append(titleInput, branchInput, textarea, actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  };

  /* --- Button handler --- */
  btn.addEventListener('click', () => {
    if (!overlay) buildModal();
    overlay.style.display = 'flex';
  });
})();
