$(function () {
    var options = {
        localStorage: {
            getItem: function (name, resolve) {
                return messenger.storage.sync.get(name).then(resolve);
            },
            setItem: function (name, value) {
                let o = {};
                o[name] = value;
                messenger.storage.sync.set(o);
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
        insertText: async function (unicode, emoji, forceText) {
            // Get the active composer.
            let [composeTab] = await messenger.tabs.query({active: true, currentWindow: true, windowType: "messageCompose"})
            if (composeTab) {
                let composeDetails = await messenger.compose.getComposeDetails(composeTab.id);
                // Find method to check if subject WAS active.
                /*
                    if (msgSubject === window.parent.document.activeElement) {
                        msgSubject.value += emoji;
                    }
                */
                if (!composeDetails.isPlainText) {
                    // HTML
                    let { inputChar }= await messenger.storage.sync.get("inputChar");
                    if (inputChar === "on") {
                        forceText = !forceText;
                    }
                    let html = forceText 
                        ? emoji 
                        : ('<img width="20" height="20" align="middle" style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="joypixels" alt="'
                            + emoji + '" src="' + 'https://cdn.jsdelivr.net/gh/joypixels/emoji-assets@v6.6.0/png/64/' + unicode + '.png">');

                    // Send a notification to the composer to insert html.
                    await messenger.tabs.sendMessage(composeTab.id, {html});
                } else {
                    // Send a notification to the composer to insert text.
                    await messenger.tabs.sendMessage(composeTab.id, {text: emoji});
                }
                
            }
            window.close();
        }
    };

    Emoji(options);

    $("#joypixels-link").click(function (e) {
        messenger.windows.openDefaultBrowser("https://www.joypixels.com/");
        //e.preventDefault();
    });
});
