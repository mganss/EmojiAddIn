"use strict";

browser.runtime.onMessage.addListener((request,sender) => {
  if (request.text) {
      document.execCommand("insertText", false, request.text);
  } else   if (request.html) {
    document.execCommand("insertHtml", false, request.html);
  }
  return Promise.resolve({});
});
