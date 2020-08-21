messenger.WindowListener.registerDefaultPrefs("defaults/preferences/defaults.js")
messenger.WindowListener.registerChromeUrl([ 
    ["content", "emoji",           "chrome/content/"],
    ["locale",  "emoji", "en-US",  "chrome/locale/en-US/"],
    ["locale",  "emoji", "de-DE",     "chrome/locale/de-DE/"]
]);
messenger.WindowListener.registerOptionsPage("chrome://emoji/content/preferences.xul");
messenger.WindowListener.registerWindow(
    "chrome://messenger/content/messenger.xul", 
    "chrome://emoji/content/messenger.js");
messenger.WindowListener.registerWindow(
    "chrome://messenger/content/messengercompose/messengercompose.xul", 
    "chrome://emoji/content/messengercompose.js");
messenger.WindowListener.registerWindow(
    "chrome://messenger/content/customizeToolbar.xul",
    "chrome://emoji/content/customizeToolbar.js");
messenger.WindowListener.registerShutdownScript("chrome://emoji/content/shutdown.js");
messenger.WindowListener.startListening();
