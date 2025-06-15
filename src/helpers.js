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

function keepFabAlive(fab, doc = document, interval = 1000) {
  const id = setInterval(() => ensureFab(fab, doc), interval);
  return id;
}

module.exports = { setLoading, validate, ensureFab, keepFabAlive };
