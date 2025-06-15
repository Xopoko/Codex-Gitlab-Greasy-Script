function setLoading(state, elements, loadingEl) {
  loadingEl.classList.toggle('visible', state);
  elements.forEach(el => {
    el.disabled = state;
  });
}

function ensureFab(fab, doc = document) {
  if (!doc.body) return;
  if (!doc.body.contains(fab)) {
    doc.body.appendChild(fab);
  }
}

function validate(titleEl, branchEl, textAreaEl, sendBtnEl) {
  const ok = titleEl.value.trim() && branchEl.value.trim() && textAreaEl.value.trim();
  sendBtnEl.disabled = !ok;
}

function watchNavigation(callback, win = window) {
  const { history } = win;
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  const invoke = () => callback();
  history.pushState = function (...args) {
    const r = origPush.apply(this, args);
    invoke();
    return r;
  };
  history.replaceState = function (...args) {
    const r = origReplace.apply(this, args);
    invoke();
    return r;
  };
  win.addEventListener('popstate', invoke);
}

module.exports = { setLoading, validate, ensureFab, watchNavigation };
