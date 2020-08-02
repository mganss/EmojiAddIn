// Import any needed modules.
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

// Load an additional JavaScript file.
Services.scriptloader.loadSubScript("chrome://quickfolders/content/quickfolders.js", this, "UTF-8");

// Conditionally load a JavaScript file for the windows plattform
if (Services.appinfo.OS == "WINNT") {
  Services.scriptloader.loadSubScript("chrome://quickfolders/content/quickfolders_windows.js", this, "UTF-8");
}

function onLoad(activatedWhileWindowOpen) {
}

function onUnload(deactivatedWhileWindowOpen) {
  // Cleaning up the window UI is only needed when the
  // add-on is being deactivated/removed while the window
  // is still open. It can be skipped otherwise.
  if (!deactivatedWhileWindowOpen) {
    return
  }
}
