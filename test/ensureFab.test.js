const { test } = require('node:test');
const assert = require('assert');
const { ensureFab } = require('../src/helpers');

function createDoc() {
  const body = {
    children: [],
    appendChild(el) { this.children.push(el); },
    removeChild(el) { this.children = this.children.filter(c => c !== el); },
    contains(el) { return this.children.includes(el); }
  };
  return {
    body,
    createElement() { return {}; }
  };
}

test('ensureFab reattaches button when missing', () => {
  const doc = createDoc();
  const btn = doc.createElement('button');
  ensureFab(btn, doc);
  assert(doc.body.contains(btn));
  doc.body.removeChild(btn);
  ensureFab(btn, doc);
  assert(doc.body.contains(btn));
});
