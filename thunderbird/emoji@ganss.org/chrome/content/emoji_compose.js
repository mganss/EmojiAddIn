"use strict";

if (!globalThis.emojiComposeRegistered) {
globalThis.emojiComposeRegistered = true;
(() => {

let blurTime = 0;
let savedRange;
function rememberSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount) savedRange = selection.getRangeAt(0).cloneRange();
}
document.addEventListener("selectionchange", rememberSelection);
function reportFocus(focused) {
    browser.runtime.sendMessage({ command: "emojiEditorFocus", focused }).catch(console.error);
}
window.addEventListener("focus", () => reportFocus(true));
window.addEventListener("blur", () => reportFocus(false));
if (document.hasFocus()) reportFocus(true);

window.addEventListener("blur", () => { blurTime = Date.now(); rememberSelection(); });

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.editorFocused) return Promise.resolve({ focus: document.hasFocus() });
  if (request.restoreSelection && (request.text || request.html)) {
    const range = savedRange;
    window.focus();
    if (range && document.contains(range.startContainer)) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  if (request.text) {
      const success = document.execCommand("insertText", false, request.text);
      rememberSelection();
      return Promise.resolve({ success });
  } else if (request.html) {
    const success = document.execCommand("insertHtml", false, request.html);
    rememberSelection();
    return Promise.resolve({ success });
  } else if (request.timestamp) {
    const maxBlur = 250;
    let blurDiff = Date.now() - blurTime;
    let focus = document.hasFocus() || blurDiff < maxBlur;
    return Promise.resolve({
      focus
    });
  }
  return Promise.resolve({});
});
})();
}
