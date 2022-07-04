"use strict";

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.text) {
      document.execCommand("insertText", false, request.text);
  } else if (request.html) {
    document.execCommand("insertHtml", false, request.html);
  } else if (request.timestamp) {
    let focus = document.hasFocus();
    return Promise.resolve({
      focus
    });
  }
  return Promise.resolve({});
});
