messenger.composeScripts.register({
    js: [{ file: "chrome/content/emoji_compose.js"}]
}).then(async () => {
    // Registration covers future composers; also support drafts open during an update.
    for (const tab of await messenger.tabs.query({ type: "messageCompose" })) {
        await messenger.tabs.executeScript(tab.id, { file: "chrome/content/emoji_compose.js" }).catch(console.error);
    }
}).catch(console.error);

// Serialize changes so switching modes quickly cannot leave a stale popup configured.
let modeUpdate = Promise.resolve();
function updateMode(mode) {
    modeUpdate = modeUpdate.catch(console.error).then(async () => {
        await messenger.composeAction.setPopup({ popup: mode === "window" ? "" : "chrome/content/emoji.html" });
        if (mode !== "window") {
            for (const pickerId of pickers.values()) await messenger.windows.remove(pickerId).catch(console.error);
            pickers.clear();
        }
    });
    return modeUpdate;
}
messenger.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.displayMode) updateMode(changes.displayMode.newValue).catch(console.error);
});
const pickers = new Map();
const destinations = new Map();
const focusUpdates = new Map();
messenger.windows.onFocusChanged.addListener(windowId => {
    if (windowId < 0) return;
    setTimeout(async () => {
        try {
            for (const tab of await messenger.tabs.query({ windowId, type: "messageCompose" })) {
                const state = await messenger.tabs.sendMessage(tab.id, { editorFocused: true });
                if ((await messenger.windows.get(windowId)).focused && state && typeof state.focus === "boolean") {
                    destinations.set(tab.id, state.focus);
                }
            }
        } catch (error) { console.error(error); }
    }, 75);
});
messenger.runtime.onMessage.addListener((request, sender) => {
    if (request.command === "emojiEditorFocus" && sender.tab && sender.tab.type === "messageCompose") {
        const tabId = sender.tab.id;
        if (request.focused) {
            destinations.set(tabId, true);
            focusUpdates.delete(tabId);
            return Promise.resolve();
        }
        // Editor blur also fires when switching to the picker. Only change the
        // destination if the compose window itself has retained focus.
        const update = new Promise(resolve => setTimeout(resolve, 75)).then(async () => {
            const win = await messenger.windows.get(sender.tab.windowId);
            if (focusUpdates.get(tabId) === update && win.focused) destinations.set(tabId, false);
        }).catch(console.error);
        focusUpdates.set(tabId, update);
        return update;
    }
    if (request.command === "emojiGetDestination") {
        return (async () => {
            await focusUpdates.get(request.tabId);
            return { body: destinations.get(request.tabId) !== false };
        })();
    }
});
let opening = Promise.resolve();
messenger.composeAction.onClicked.addListener(tab => {
    opening = opening.catch(console.error).then(async () => {
        await modeUpdate;
        const settings = await messenger.storage.local.get(["displayMode", "pickerBounds"]);
        if (settings.displayMode !== "window") return;
        const existing = pickers.get(tab.id);
        if (existing !== undefined) {
            try { await messenger.windows.update(existing, { focused: true }); return; }
            catch (_) { pickers.delete(tab.id); }
        }
        const target = await messenger.tabs.sendMessage(tab.id, { timestamp: true }).catch(() => ({ focus: true }));
        if (!destinations.has(tab.id)) destinations.set(tab.id, !target || target.focus !== false);
        const bounds = settings.pickerBounds || {};
        const createData = {
            type: "popup",
            url: messenger.runtime.getURL("chrome/content/emoji.html") + "?composeTab=" + tab.id,
            width: Math.max(320, Math.min(800, bounds.width || 340)),
            height: Math.max(350, Math.min(1000, bounds.height || 600))
        };
        if (Number.isInteger(bounds.left) && Number.isInteger(bounds.top)) {
            createData.left = bounds.left;
            createData.top = bounds.top;
        }
        let picker;
        try { picker = await messenger.windows.create(createData); }
        catch (error) {
            // A saved monitor position may no longer be available.
            if (createData.left === undefined) throw error;
            delete createData.left;
            delete createData.top;
            picker = await messenger.windows.create(createData);
        }
        pickers.set(tab.id, picker.id);
        // The user may have closed the draft while the picker was opening.
        try { await messenger.compose.getComposeDetails(tab.id); }
        catch (_) { pickers.delete(tab.id); await messenger.windows.remove(picker.id); }
    });
    opening.catch(console.error);
});
messenger.windows.onRemoved.addListener(windowId => {
    for (const [tabId, pickerId] of pickers) {
        if (pickerId === windowId) pickers.delete(tabId);
    }
});
messenger.tabs.onRemoved.addListener(tabId => {
    destinations.delete(tabId);
    focusUpdates.delete(tabId);
    const pickerId = pickers.get(tabId);
    if (pickerId !== undefined) {
        pickers.delete(tabId);
        messenger.windows.remove(pickerId).catch(console.error);
    }
});
messenger.storage.local.get("displayMode").then(settings => updateMode(settings.displayMode)).catch(console.error);
