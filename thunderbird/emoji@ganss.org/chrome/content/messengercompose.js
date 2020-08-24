// Import any needed modules.
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

function onLoad(activatedWhileWindowOpen) {
    WL.injectCSS("chrome://emoji/content/skin/style.css");

    let xul = `<menupopup id="menu_View_Popup">
    <menuitem id="menu_EmojiSidebar" insertafter="menu_AddressSidebar" label="&emojiSidebar.label;" accesskey="&emojiSidebar.accesskey;" type="checkbox" oncommand="EmojiOverlay.toggleEmoji();" />
  </menupopup>
  <hbox flex="1" id="composeContentBox">
    <splitter id="emoji-splitter" />
    <vbox id="emoji-box" persist="sidebarVisible width" hidden="true">
      <box id="emoji-header" align="center" class="sidebar-header">
        <label id="emoji-title" value="Emoji" />
        <spacer flex="1"/>
        <toolbarbutton class="ab-closebutton close-icon" oncommand="EmojiOverlay.toggleEmoji();" />
      </box>
      <browser id="emoji" flex="1" src="" disablehistory="true" tooltip="browserTooltip" />
      <tooltip id="browserTooltip" onpopupshowing="return EmojiOverlay.fillTooltip(this)" />
    </vbox>
  </hbox>
  <toolbarpalette id="MsgComposeToolbarPalette">
    <toolbarbutton class="toolbarbutton-1" insertafter="button-save"
      id="button-emoji" label="&emojiButton.label;"
      tooltiptext="&emojiButton.tooltip;"
      oncommand="EmojiOverlay.toggleEmoji();" removable="true" />
  </toolbarpalette>
  `;

    WL.injectElements(xul, ["chrome://emoji/locale/emoji.dtd"]);

    Services.scriptloader.loadSubScript("chrome://emoji/content/overlay.js", this, "UTF-8");
}

function onUnload(deactivatedWhileWindowOpen) {
  // Cleaning up the window UI is only needed when the
  // add-on is being deactivated/removed while the window
  // is still open. It can be skipped otherwise.
  if (!deactivatedWhileWindowOpen) {
    return
  }
}
