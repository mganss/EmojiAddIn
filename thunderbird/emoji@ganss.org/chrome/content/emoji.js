$(function () {
    var storage = window.parent.EmojiOverlay.messenger.storage;
    Components.utils.import('resource://gre/modules/Services.jsm');

    var options = {
        localStorage: {
            getItem: function (name) {
                return storage.sync.get(name);
            },
            setItem: function (name, value) {
                let o = {};
                o[name] = value;
                storage.sync.set(o);
            }
        },
        createEmojiImage: function (e) {
            var val = e.Value;
            var unicode = e.Key;
            var span = document.createElement("span");
            var sheet = (typeof val.tone !== 'undefined') && val.tone !== "0" ? "diversity" : val.category;
            var classes = ["joypixels", "joypixels-32-" + sheet, "_" + unicode, val.category];

            span.id = unicode;
            span.title = val.name;
            span.setAttribute("data-codepoint", val.codepoint);
            if (typeof val.tone !== 'undefined') classes.push("tone-" + val.tone);
            span.className = classes.join(" ");

            return span;
        },
        insertText: function (unicode, emoji, forceText) {
            if (typeof (window.parent.chatHandler) === "undefined") {
                var msgSubject = window.parent.document.getElementById("msgSubject");
                if (msgSubject === window.parent.document.activeElement) {
                    msgSubject.value += emoji;
                } else {
                    var editorElement = window.parent.document.getElementById("content-frame");
                    if (editorElement.editortype === "htmlmail") {
                        storage.sync.get("insertChar").then(r => {
                            if (r.insertChar) {
                                forceText = !forceText;
                            }
                            var htmlEditor = editorElement.getHTMLEditor(editorElement.contentWindow);
                            var html = forceText ? emoji : ('<img style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="joypixels" alt="'
                                + emoji + '" src="' + 'https://cdn.jsdelivr.net/gh/joypixels/emoji-assets@v5.5.1/png/64/' + unicode + '.png">');
                            htmlEditor.insertHTML(html);
                        });
                    } else {
                        var textEditor = editorElement.getEditor(editorElement.contentWindow).QueryInterface(Components.interfaces.nsIPlaintextEditor);
                        textEditor.insertText(emoji);
                    }
                }
            } else {
                var acv = window.parent.chatHandler._getActiveConvView();
                if (acv) {
                    var editor = acv.editor;
                    editor.value += emoji;
                }
            }
        }
    };

    Emoji(options);

    $("#joypixels-link").click(function (e) {
        var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
        messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
        messenger.launchExternalURL("https://www.joypixels.com/");
        e.preventDefault();
    });
});
