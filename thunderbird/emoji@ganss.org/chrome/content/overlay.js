window.EmojiOverlay = {

    toggleEmoji: function () {
        var sidebarBox = document.getElementById("emoji-box");
        var sidebarSplitter = document.getElementById("emoji-splitter");
        var menuItem = document.getElementById("menu_EmojiSidebar");
        var button = document.getElementById("button-emoji");
        if (sidebarBox.hidden) {
            sidebarBox.hidden = false;
            sidebarSplitter.hidden = false;
            if (button !== null) {
                button.setAttribute("checked", "true");
            }
            menuItem.setAttribute("checked", "true");

            var sidebar = document.getElementById("emoji");
            var sidebarUrl = sidebar.getAttribute("src");
            // if we have yet to initialize the src url on the sidebar then go ahead and do so now...
            // we do this lazily here, so we don't spend time when bringing up the compose window loading the emoji sidebar
            // data sources. Only when the user opens the emoji sidebar do we set the src url for the sidebar...
            if (sidebarUrl === "")
                sidebar.setAttribute("src", "chrome://emoji/content/emoji.html");

            sidebarBox.setAttribute("sidebarVisible", "true");
        }
        else {
            sidebarBox.hidden = true;
            sidebarSplitter.hidden = true;
            sidebarBox.setAttribute("sidebarVisible", "false");
            if (button !== null) {
                button.setAttribute("checked", "false");
            }
            menuItem.setAttribute("checked", "false");
        }
    },

    emoji_is_hidden: function () {
        var emoji_box = document.getElementById('emoji-box');
        return emoji_box.getAttribute('hidden') === 'true';
    },

    emoji_is_collapsed: function () {
        var emoji_splitter = document.getElementById('emoji-splitter');
        return (emoji_splitter &&
            emoji_splitter.getAttribute('state') === 'collapsed');
    },

    emojiSetState: function (aState) {
        document.getElementById("emoji-box").hidden = aState !== "visible";
        document.getElementById("emoji-splitter").hidden = aState === "hidden";
    },

    emojiGetState: function () {
        if (window.EmojiOverlay.emoji_is_hidden())
            return "hidden";
        if (window.EmojiOverlay.emoji_is_collapsed())
            return "collapsed";
        return "visible";
    },

    togglePrint: function (aHide) {
        if (aHide) {
            window.gChromeState.emoji = window.EmojiOverlay.emojiGetState();
            window.EmojiOverlay.emojiSetState("hidden");
        }
        else {
            // restoring normal mode (i.e., leaving print preview mode)
            window.EmojiOverlay.emojiSetState(window.gChromeState.emoji);
        }
    },

    fillTooltip: function (tooltip) {
        if (document.tooltipNode.hasAttribute("title")) {
            tooltip.setAttribute("label", document.tooltipNode.getAttribute("title"));
            return true;
        }
    
        return false;
    },

    installButton: function (toolbarId, id, afterId) {
        if (!document.getElementById(id)) {
            var toolbar = document.getElementById(toolbarId);

            if (toolbar) {
                // If no afterId is given, then append the item to the toolbar
                var before = null;
                if (afterId) {
                    let elem = document.getElementById(afterId);
                    if (elem && elem.parentNode === toolbar)
                        before = elem.nextElementSibling;
                }

                toolbar.insertItem(id, before);
                toolbar.setAttribute("currentset", toolbar.currentSet);
                document.persist(toolbar.id, "currentset");
            }
        }
    },

    messenger: WL.messenger
};

function onLoad() {
    if (document.URL.includes("messengercompose")) {
        // add toolbar button
        WL.messenger.storage.sync.get("installed").then(r => {
            if (!r.installed) {
                window.setTimeout(() => {
                    window.EmojiOverlay.installButton("composeToolbar2", "button-emoji", "button-save");
                    WL.messenger.storage.sync.set({
                        installed: true
                    });
                }, 0);
            }
        });
    }

    // show sidebar    
    var sideBarBox = document.getElementById('emoji-box');
    if (sideBarBox.getAttribute("sidebarVisible") === "true") {
        // if we aren't supposed to have the side bar hidden, make sure it is visible
        if (document.getElementById("emoji").getAttribute("src") === "")
            window.setTimeout(window.EmojiOverlay.toggleEmoji, 0);   // do this on a delay so we don't hurt perf. on bringing up a new compose window
    }

    if (typeof (window.PrintPreviewListener) !== "undefined") {
        var onEnter = window.PrintPreviewListener.onEnter;
        var onExit = window.PrintPreviewListener.onExit;

        window.PrintPreviewListener.onEnter = function () {
            onEnter();
            window.EmojiOverlay.togglePrint(true);
        };
        window.PrintPreviewListener.onExit = function () {
            onExit();
            window.EmojiOverlay.togglePrint(false);
        };
    }
}

onLoad();
