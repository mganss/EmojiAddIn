$(function () {
    var options = {
        insertIntoBody: true,
        localStorage: {
            getItem: function (name, resolve) {
                return messenger.storage.local.get(name).then(resolve);
            },
            setItem: function (name, value) {
                let o = {};
                o[name] = value;
                messenger.storage.local.set(o);
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
            let [composeTab] = await messenger.tabs.query({ active: true, currentWindow: true, windowType: "messageCompose" })
            if (composeTab) {
                let composeDetails = await messenger.compose.getComposeDetails(composeTab.id);
                if (options.insertIntoBody) {
                    if (!composeDetails.isPlainText) {
                        // HTML
                        let { inputChar } = await messenger.storage.local.get("inputChar");
                        if (inputChar === "on") {
                            forceText = !forceText;
                        }
                        let html = forceText
                            ? emoji
                            : ('<img width="20" height="20" align="middle" style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="joypixels" alt="'
                                + emoji + '" src="' + 'https://cdn.jsdelivr.net/gh/joypixels/emoji-assets@v7.0.0/png/64/' + unicode + '.png">');

                        // Send a notification to the composer to insert html.
                        await messenger.tabs.sendMessage(composeTab.id, { html });
                    } else {
                        // Send a notification to the composer to insert text.
                        await messenger.tabs.sendMessage(composeTab.id, { text: emoji });
                    }
                } else {
                    let subject = composeDetails.subject + emoji;
                    await messenger.compose.setComposeDetails(composeTab.id, { subject });
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

    messenger.tabs.query({ active: true, currentWindow: true, windowType: "messageCompose" }).then(result => {
        let [composeTab] = result;
        messenger.tabs.sendMessage(composeTab.id, { timestamp: true }).then(focusResult => {
            options.insertIntoBody = focusResult.focus;
        });
    });

    let tooltip = document.getElementById("tooltip");
    let contentMain = document.getElementById("content-main");

    contentMain.addEventListener("mouseover", e => {
        if (e.target.matches("span[title]")) {
            let title = e.target.title;
            tooltip.innerHTML = title;
        }
    });
    contentMain.addEventListener("mouseout", e => {
        tooltip.innerHTML = "";
    });
});
