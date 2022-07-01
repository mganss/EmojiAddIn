"use strict";

var blurTimestamp = Date.now();

window.addEventListener("blur", _ => blurTimestamp = Date.now());

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.text) {
      document.execCommand("insertText", false, request.text);
  } else if (request.html) {
    document.execCommand("insertHtml", false, request.html);
  } else if (request.timestamp) {
    return Promise.resolve({
      blur: blurTimestamp
    });
  }
  return Promise.resolve({});
});
