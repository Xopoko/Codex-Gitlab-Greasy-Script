function setLoading(state, elements, loadingEl) {
  loadingEl.classList.toggle('visible', state);
  elements.forEach(el => {
    el.disabled = state;
  });
}

function validate(titleEl, branchEl, textAreaEl, sendBtnEl) {
  const ok = titleEl.value.trim() && branchEl.value.trim() && textAreaEl.value.trim();
  sendBtnEl.disabled = !ok;
}

module.exports = { setLoading, validate };
