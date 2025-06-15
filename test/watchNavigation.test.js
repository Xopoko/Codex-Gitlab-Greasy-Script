const { test } = require('node:test');
const assert = require('assert');
const { watchNavigation } = require('../src/helpers');

function createWindow() {
  const listeners = {};
  return {
    history: {
      pushState: function(){},
      replaceState: function(){},
    },
    addEventListener(event, fn) { listeners[event] = fn; },
    dispatchEvent(event) { if(listeners[event.type]) listeners[event.type](event); },
    _listeners: listeners
  };
}

test('watchNavigation triggers callback on history changes', () => {
  const win = createWindow();
  let called = 0;
  watchNavigation(() => called++, win);

  win.history.pushState({}, '', '/foo');
  assert.strictEqual(called, 1);

  win.history.replaceState({}, '', '/bar');
  assert.strictEqual(called, 2);

  win.dispatchEvent({ type: 'popstate' });
  assert.strictEqual(called, 3);
});
