$(function () {
    // The compose window blocks remote content by default, so the image is embedded as a data URL.
    async function createEmojiHtml(unicode, emoji) {
        let src = 'https://cdn.jsdelivr.net/gh/joypixels/emoji-assets@v11.0.0/png/64/' + unicode + '.png';
        try {
            let response = await fetch(src);
            if (!response.ok) throw new Error(response.statusText);
            let blob = await response.blob();
            src = await new Promise((resolve, reject) => {
                let reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return emoji;
        }
        return '<img width="20" height="20" align="middle" style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="joypixels" alt="'
            + emoji + '" src="' + src + '">';
    }
    var options = {
        confirmInsertion: true,
        localStorage: {
            getItem: function (name, resolve) {
                return messenger.storage.local.get(name).then(resolve);
            },
            setItem: function (name, value) {
                let o = {};
                o[name] = value;
                return messenger.storage.local.set(o);
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
        insertText: async function (unicode, emoji, forceText, onSuccess) {
            if (options.inserting) return;
            options.inserting = true;
            try {
            // Get the active composer.
            let [composeTab] = await messenger.tabs.query({ active: true, currentWindow: true, windowType: "messageCompose" })
            if (!composeTab) throw new Error("No active compose window.");
            let insertIntoBody = await focusTarget;
                let composeDetails = await messenger.compose.getComposeDetails(composeTab.id);
                if (insertIntoBody) {
                    if (!composeDetails.isPlainText) {
                        // HTML
                        let { inputChar } = await messenger.storage.local.get("inputChar");
                        if (inputChar === "on") {
                            forceText = !forceText;
                        }
                        let html = forceText
                            ? emoji
                            : await createEmojiHtml(unicode, emoji);

                        // Send a notification to the composer to insert html.
                        let result = await messenger.tabs.sendMessage(composeTab.id, { html });
                        if (!result || !result.success) throw new Error("The message editor could not insert the emoji.");
                    } else {
                        // Send a notification to the composer to insert text.
                        let result = await messenger.tabs.sendMessage(composeTab.id, { text: emoji });
                        if (!result || !result.success) throw new Error("The message editor could not insert the emoji.");
                    }
                } else {
                    let subject = composeDetails.subject + emoji;
                    await messenger.compose.setComposeDetails(composeTab.id, { subject });
                }
            onSuccess(function () { window.close(); });
            } catch (error) {
                options.inserting = false;
                console.error(error);
                alert("Could not insert the emoji. Please try again.");
            }
        }
    };

    Emoji(options);

    $("#joypixels-link").click(function (e) {
        e.preventDefault();
        messenger.windows.openDefaultBrowser("https://www.joypixels.com/");
    });

    let focusTarget = messenger.tabs.query({ active: true, currentWindow: true, windowType: "messageCompose" }).then(result => {
        let [composeTab] = result;
        if (!composeTab) throw new Error("No active compose window.");
        return messenger.tabs.sendMessage(composeTab.id, { timestamp: true });
    }).then(focusResult => {
        if (!focusResult || typeof focusResult.focus !== "boolean") throw new Error("Could not determine the insertion target.");
        return focusResult.focus;
    });
    // Mark the rejection handled until an insertion awaits it.
    focusTarget.catch(() => {});

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
