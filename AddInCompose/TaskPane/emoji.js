Office.initialize = function () {
    $(function () {
        var options = {
            localStorage: window.localStorage,
            createEmojiImage: function (e) {
                var val = e.Value;
                var span = document.createElement("span");
                var classes = ["emojione emojione-" + val.unicode, val.category];

                span.title = val.name;
                span.id = val.unicode;
                if (typeof val.tone !== 'undefined') classes.push("tone-" + val.tone);
                span.className = classes.join(" ");

                return span;
            },
            insertText: function (unicode, emoji) {
                Office.context.mailbox.item.body.getTypeAsync(function (asyncResult) {
                    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                        var html = asyncResult.value === Office.MailboxEnums.BodyType.Html;
                        var textToInsert = html ?
                            '<img width="20" height="20" align="middle" style="width: 3ex; height: 3ex; min-width: 20px; min-height: 20px; display: inline-block; margin: 0 .15em .2ex; line-height: normal; vertical-align: middle" class="emojione" alt="' + emoji + '" src="' + 'https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.1/assets/png/' + unicode + '.png">'
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
    })
}
