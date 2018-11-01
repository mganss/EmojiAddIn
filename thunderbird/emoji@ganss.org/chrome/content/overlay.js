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

function installButton(toolbarId, id, afterId) {
    if (!document.getElementById(id)) {
        var toolbar = document.getElementById(toolbarId);

        // If no afterId is given, then append the item to the toolbar
        var before = null;
        if (afterId) {
            let elem = document.getElementById(afterId);
            if (elem && elem.parentNode == toolbar)
                before = elem.nextElementSibling;
        }

        toolbar.insertItem(id, before);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
    }
}

Components.utils.import('resource://gre/modules/Services.jsm');
var prefs = Services.prefs.getBranch("extensions.emoji.");

window.addEventListener("load", function (e) {
    // add toolbar button
    var installed = prefs.prefHasUserValue("installed");
    if (!installed) {
        setTimeout(() => {
            installButton("composeToolbar2", "button-emoji", "button-save");
            prefs.setBoolPref("installed", true);                
        }, 0);
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
