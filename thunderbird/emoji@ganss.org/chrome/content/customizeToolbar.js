// Import any needed modules.
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

function onLoad(activatedWhileWindowOpen) {
    WL.injectCSS("chrome://emoji/content/skin/style.css");
}

function onUnload(deactivatedWhileWindowOpen) {
  // Cleaning up the window UI is only needed when the
  // add-on is being deactivated/removed while the window
  // is still open. It can be skipped otherwise.
  if (!deactivatedWhileWindowOpen) {
    return;
  }
}
