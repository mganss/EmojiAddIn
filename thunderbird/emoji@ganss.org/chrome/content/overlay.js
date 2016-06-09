function toggleEmoji() {
    var sidebarBox = document.getElementById("emoji-box");
    var sidebarSplitter = document.getElementById("emoji-splitter");
    var elt = document.getElementById("viewEmoji");
    if (sidebarBox.hidden) {
        sidebarBox.hidden = false;
        sidebarSplitter.hidden = false;
        elt.setAttribute("checked", "true");

        var sidebar = document.getElementById("emoji");
        var sidebarUrl = sidebar.getAttribute("src");
        // if we have yet to initialize the src url on the sidebar then go ahead and do so now...
        // we do this lazily here, so we don't spend time when bringing up the compose window loading the emoji sidebar
        // data sources. Only when the user opens the emoji sidebar do we set the src url for the sidebar...
        if (sidebarUrl == "")
            sidebar.setAttribute("src", "chrome://emoji/content/emoji.html");

        sidebarBox.setAttribute("sidebarVisible", "true");
    }
    else {
        sidebarBox.hidden = true;
        sidebarSplitter.hidden = true;
        sidebarBox.setAttribute("sidebarVisible", "false");
        elt.removeAttribute("checked");
    }
}

function emoji_is_hidden() {
  var emoji_box = document.getElementById('emoji-box');
  return emoji_box.getAttribute('hidden') == 'true';
}

function emoji_is_collapsed() {
  var emoji_splitter = document.getElementById('emoji-splitter');
  return (emoji_splitter &&
          emoji_splitter.getAttribute('state') == 'collapsed');
}

function emojiSetState(aState) {
  document.getElementById("emoji-box").hidden = aState != "visible";
  document.getElementById("emoji-splitter").hidden = aState == "hidden";
}

function emojiGetState() {
  if (emoji_is_hidden())
    return "hidden";
  if (emoji_is_collapsed())
    return "collapsed";
  return "visible";
}

function togglePrint(aHide) {
    if (aHide) {
        gChromeState.emoji = emojiGetState();
        emojiSetState("hidden");
    }
    else {
        // restoring normal mode (i.e., leaving print preview mode)
        emojiSetState(gChromeState.emoji);
    }
}

function fillTooltip(tooltip)
{
    if (document.tooltipNode.hasAttribute("title"))
    {
        tooltip.setAttribute("label", document.tooltipNode.getAttribute("title"));
        return true;
    }
    
    return false;
}

window.addEventListener("load", function (e) {
    // add toolbar button
    var installed = Application.prefs.getValue("extensions.emoji.installed", null);
    if (!installed) {
        var navbar = document.getElementById("composeToolbar2");
        if (navbar.currentSet.indexOf("button-emoji") === -1) {
            var newset = navbar.currentSet + ",button-emoji";
            navbar.currentSet = newset;
            navbar.setAttribute("currentset", newset);
            document.persist("composeToolbar2", "currentset");
        }
        Application.prefs.setValue("extensions.emoji.installed", true);
    }

    // show sidebar    
    var sideBarBox = document.getElementById('emoji-box');
    if (sideBarBox.getAttribute("sidebarVisible") == "true") {
        // if we aren't supposed to have the side bar hidden, make sure it is visible
        if (document.getElementById("emoji").getAttribute("src") == "")
            setTimeout(toggleEmoji, 0);   // do this on a delay so we don't hurt perf. on bringing up a new compose window
    }

    var onEnter = PrintPreviewListener.onEnter;
    var onExit = PrintPreviewListener.onExit;

    PrintPreviewListener.onEnter = function () {
        onEnter();
        togglePrint(true);
    }
    PrintPreviewListener.onExit = function () {
        onExit();
        togglePrint(false);
    }
})
