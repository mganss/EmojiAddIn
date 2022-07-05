"use strict";

let blurTime = 0;

window.addEventListener("blur", e => blurTime = Date.now());

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.text) {
      document.execCommand("insertText", false, request.text);
  } else if (request.html) {
    document.execCommand("insertHtml", false, request.html);
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
