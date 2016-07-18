$(function () {
    var options = {
        localStorage: {
            getItem: function (name) {
                return Application.prefs.getValue("extensions.emoji." + name, null);
            },
            setItem: function (name, value) {
                Application.prefs.setValue("extensions.emoji." + name, value);
            }
        },
        createEmojiImage: function(e) {
            var val = e.Value;
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            var classes = ["emojione emojione-" + val.unicode, val.category];

            svg.title = val.name;
            svg.setAttribute("data-unicode", val.unicode);

            var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "emojione.sprites.svg#emoji-" + val.unicode);
            use.setAttribute("title", val.name);
            svg.appendChild(use);
            
            if (typeof val.tone !== 'undefined') classes.push("tone-" + val.tone);
            svg.setAttribute("class", classes.join(" "));

            return svg;
        },
        insertText: function(unicode, emoji) {
            var editorElement = window.parent.document.getElementById("content-frame");
            if (editorElement.editortype === "htmlmail") {
                var htmlEditor = editorElement.getHTMLEditor(editorElement.contentWindow);
                var html = '<img style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="emojione" alt="'
                    + emoji + '" src="' + 'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.6/assets/png/' + unicode + '.png">';
                htmlEditor.insertHTML(html);
            } else {
                var textEditor = editorElement.getEditor(editorElement.contentWindow).QueryInterface(Components.interfaces.nsIPlaintextEditor);
                textEditor.insertText(emoji);
            }
        }
    };

    Emoji(options);

    $("#emojione-link").click(function (e) {
        var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();
        messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
        messenger.launchExternalURL("http://emojione.com/");
        e.preventDefault();
    });
})

