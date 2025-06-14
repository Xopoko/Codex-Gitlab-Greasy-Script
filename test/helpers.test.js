const { test } = require("node:test");
const assert = require('assert');
const { setLoading, validate } = require('../src/helpers');

function createEl() {
  return {
    disabled: false,
    value: '',
    classList: {
      _set: new Set(),
      toggle(name, flag) {
        if(flag === undefined) {
          if(this._set.has(name)) this._set.delete(name); else this._set.add(name);
        } else {
          if(flag) this._set.add(name); else this._set.delete(name);
        }
      },
      contains(name) { return this._set.has(name); }
    }
  };
}

test('setLoading toggles visibility and disables fields', () => {
  const loading = createEl();
  const a = createEl();
  const b = createEl();
  setLoading(true, [a, b], loading);
  assert(loading.classList.contains('visible'));
  assert(a.disabled && b.disabled);
  setLoading(false, [a, b], loading);
  assert(!loading.classList.contains('visible'));
  assert(!a.disabled && !b.disabled);
});

test('validate enables send button when all fields have text', () => {
  const title = createEl();
  const branch = createEl();
  const textArea = createEl();
  const sendBtn = createEl();

  validate(title, branch, textArea, sendBtn);
  assert(sendBtn.disabled, 'should disable when empty');

  title.value = 'a';
  branch.value = 'b';
  textArea.value = 'c';
  validate(title, branch, textArea, sendBtn);
  assert.strictEqual(sendBtn.disabled, false);
});
