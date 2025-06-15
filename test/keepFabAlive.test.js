const { test } = require('node:test');
const assert = require('assert');
const { keepFabAlive } = require('../src/helpers');
const { setTimeout: delay } = require('timers/promises');

function createDoc() {
  const body = {
    children: [],
    appendChild(el) { this.children.push(el); },
    contains(el) { return this.children.includes(el); },
    removeChild(el) { this.children = this.children.filter(c => c !== el); }
  };
  return { body };
}

test('keepFabAlive reattaches fab periodically', async () => {
  const doc = createDoc();
  const fab = {};
  const id = keepFabAlive(fab, doc, 10);
  await delay(15); // first tick
  assert(doc.body.contains(fab));

  doc.body.removeChild(fab);
  await delay(15);
  assert(doc.body.contains(fab));

  clearInterval(id);
});
