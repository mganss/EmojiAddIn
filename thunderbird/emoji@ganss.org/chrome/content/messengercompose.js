// Import any needed modules.
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

function onLoad(activatedWhileWindowOpen) {
    let os = Services.appinfo.OS;
    let skin = os === "Darwin" ? "mac" : (os === "Linux" ? "linux" : "win"); 

    injectCSS("chrome://emoji/content/skin/style.css");
    injectCSS(`chrome://emoji/content/skin/${skin}/emoji.css`);

    let xul = `<menupopup id="menu_View_Popup">
    <menuitem id="menu_EmojiSidebar" insertafter="menu_AddressSidebar" label="&emojiSidebar.label;" accesskey="&emojiSidebar.accesskey;" type="checkbox" oncommand="window.${namespace}.toggleEmoji();" />
  </menupopup>
  <hbox flex="1" id="composeContentBox">
    <splitter id="emoji-splitter" />
    <vbox id="emoji-box" persist="sidebarVisible width" hidden="true">
      <sidebarheader id="emoji-header" align="center">
        <label id="emoji-title" value="Emoji" />
        <spacer flex="1"/>
        <toolbarbutton class="ab-closebutton close-icon" oncommand="window.${namespace}.toggleEmoji();" />
      </sidebarheader>
      <browser id="emoji" flex="1" src="" disablehistory="true" tooltip="browserTooltip" />
      <tooltip id="browserTooltip" onpopupshowing="return window.${namespace}.fillTooltip(this)" />
    </vbox>
  </hbox>
  <toolbarpalette id="MsgComposeToolbarPalette">
    <toolbarbutton class="toolbarbutton-1" insertafter="button-save"
      id="button-emoji" label="&emojiButton.label;"
      tooltiptext="&emojiButton.tooltip;"
      oncommand="window.${namespace}.toggleEmoji();" />
  </toolbarpalette>
  `;

    injectElements(xul, ["chrome://emoji/locale/emoji.dtd"]);

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
