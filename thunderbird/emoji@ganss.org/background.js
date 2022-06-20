// messenger.WindowListener.registerChromeUrl([ 
//     ["content", "emoji",           "chrome/content/"],
//     ["locale",  "emoji", "en-US",  "chrome/locale/en-US/"],
//     ["locale",  "emoji", "de-DE",     "chrome/locale/de-DE/"]
// ]);
// messenger.WindowListener.registerWindow(
//     "chrome://messenger/content/messenger.xhtml", 
//     "chrome://emoji/content/messenger.js");
//messenger.WindowListener.registerWindow(
//    "chrome://messenger/content/messengercompose/messengercompose.xhtml", 
//    "chrome://emoji/content/messengercompose.js");
// messenger.WindowListener.registerWindow(
//     "chrome://messenger/content/customizeToolbar.xhtml",
//     "chrome://emoji/content/customizeToolbar.js");
// messenger.WindowListener.startListening();

messenger.composeScripts.register({
    js: [{ file: "chrome/content/emoji_compose.js"}]
});
