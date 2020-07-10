$(function () {
    Components.utils.import('resource://gre/modules/Services.jsm');
    var prefs = Services.prefs.getBranch("extensions.emoji.");

    var options = {
        localStorage: {
            getItem: function (name) {
                return prefs.prefHasUserValue(name) ? prefs.getCharPref(name) : null;
            },
            setItem: function (name, value) {
                prefs.setCharPref(name, value);
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
                if (msgSubject.hasAttribute("focused")) {
                    msgSubject.value += emoji;
                } else {
                    var editorElement = window.parent.document.getElementById("content-frame");
                    if (editorElement.editortype === "htmlmail") {
                        if (prefs.getBoolPref("insertChar", false)) {
                            forceText = !forceText;
                        }
                        var htmlEditor = editorElement.getHTMLEditor(editorElement.contentWindow);
                        var html = forceText ? emoji : ('<img style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="joypixels" alt="'
                            + emoji + '" src="' + 'https://cdn.jsdelivr.net/gh/joypixels/emoji-assets@v5.5.1/png/64/' + unicode + '.png">');
                        htmlEditor.insertHTML(html);
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
