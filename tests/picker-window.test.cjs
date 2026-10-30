const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const event = () => ({ addListener(fn) { this.listener = fn; } });
const settings = { displayMode: 'window', pickerBounds: { width: 400, height: 650, left: 10, top: 20 } };
const created = [], focused = [], removed = [], popups = [];
let nextId = 100;
const messenger = {
    composeScripts: { register: async () => {} },
    compose: { getComposeDetails: async () => ({}) },
    composeAction: { setPopup: async value => popups.push(value.popup), onClicked: event() },
    runtime: { getURL: path => 'moz-extension://test/' + path, onMessage: event() },
    storage: { local: { get: async () => ({ ...settings }) }, onChanged: event() },
    tabs: { query: async () => [], executeScript: async () => {}, sendMessage: async () => ({ focus: true }), onRemoved: event() },
    windows: {
        get: async () => ({ focused: composeFocused }),
        create: async data => { created.push(data); return { id: nextId++ }; },
        update: async id => focused.push(id),
        remove: async id => removed.push(id), onRemoved: event(), onFocusChanged: event()
    }
};
let composeFocused = true;
const scope = vm.createContext({ messenger, console, setTimeout });
vm.runInContext(fs.readFileSync('thunderbird/emoji@ganss.org/background.js', 'utf8'), scope);
const flush = () => new Promise(resolve => setImmediate(resolve));
(async () => {
    await flush();
    messenger.composeAction.onClicked.listener({ id: 1 });
    await flush();
    assert.equal(created.length, 1);
    assert.match(created[0].url, /composeTab=1$/);
    assert.equal(created[0].width, 400);
    messenger.composeAction.onClicked.listener({ id: 1 });
    await flush();
    assert.deepEqual(focused, [100]);
    assert.equal(created.length, 1, 'Repeated clicks must reuse the picker');
    const sender = { tab: { id: 1, windowId: 10, type: 'messageCompose' } };
    const send = request => messenger.runtime.onMessage.listener(request, sender);
    await send({ command: 'emojiEditorFocus', focused: false });
    assert.equal((await send({ command: 'emojiGetDestination', tabId: 1 })).body, false);
    // Leaving the compose window must retain the last destination.
    composeFocused = false;
    await send({ command: 'emojiEditorFocus', focused: false });
    assert.equal((await send({ command: 'emojiGetDestination', tabId: 1 })).body, false);
    await send({ command: 'emojiEditorFocus', focused: true });
    await send({ command: 'emojiEditorFocus', focused: false });
    assert.equal((await send({ command: 'emojiGetDestination', tabId: 1 })).body, true);
    messenger.composeAction.onClicked.listener({ id: 2 });
    await flush();
    assert.match(created[1].url, /composeTab=2/);
    messenger.tabs.onRemoved.listener(1);
    await flush();
    assert.deepEqual(removed, [100]);
    messenger.windows.onRemoved.listener(101);
    messenger.composeAction.onClicked.listener({ id: 2 });
    await flush();
    assert.equal(created.length, 3, 'Closed picker must be recreated');
    settings.displayMode = 'popup';
    messenger.storage.onChanged.listener({ displayMode: { newValue: 'popup' } }, 'local');
    await flush();
    assert.equal(popups.at(-1), 'chrome/content/emoji.html');
    assert.deepEqual(removed, [100, 102]);
    const manifest = JSON.parse(fs.readFileSync('thunderbird/emoji@ganss.org/manifest.json'));
    assert.equal(manifest.experiment_apis, undefined);
    assert.deepEqual(manifest.permissions, ['storage', 'compose']);
    console.log('Picker reuse, draft binding, cleanup, mode switching, and permissions passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
