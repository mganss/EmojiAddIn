Office.initialize = function () {
    $(function () {
        var options = {
            localStorage: {
                getItem: function (name, resolve) {
                    var val = window.localStorage.getItem(name);
                    var o = {};
                    o[name] = val;
                    resolve(o);
                },
                setItem: function (name, value) {
                    window.localStorage.setItem(name, value);
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
                Office.context.mailbox.item.body.getTypeAsync(function (asyncResult) {
                    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                        var html = asyncResult.value === Office.MailboxEnums.BodyType.Html;
                        var textToInsert = (html && !forceText) ?
                            '<img width="20" height="20" align="middle" style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="joypixels" alt="' + emoji + '" src="' + 'https://cdn.jsdelivr.net/gh/joypixels/emoji-assets@v6.6.0/png/64/' + unicode + '.png">'
                            : emoji;
                        Office.context.mailbox.item.body.setSelectedDataAsync(
                            textToInsert,
                            { coercionType: html ? Office.CoercionType.Html : Office.CoercionType.Text },
                            function (asyncResult) {
                                if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
                                    if (typeof Office.context.mailbox.item.notificationMessages !== 'undefined') {
                                        Office.context.mailbox.item.notificationMessages.addAsync("insertTextError", {
                                            type: "errorMessage",
                                            message: "Failed to insert emoji \"" + emoji + "\": " + asyncResult.error.message
                                        });
                                    }
                                }
                            });
                    } else {
                        if (typeof Office.context.mailbox.item.notificationMessages !== 'undefined') {
                            Office.context.mailbox.item.notificationMessages.addAsync("insertTextError", {
                                type: "errorMessage",
                                message: "Failed to insert emoji \"" + emoji + "\": " + asyncResult.error.message
                            });
                        }
                    }
                });
            }
        };

        Emoji(options);
    });
};
