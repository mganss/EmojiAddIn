/* jshint esversion: 6 */

messenger = window.messenger.extension.getBackgroundPage().messenger;

function localize() {
    document.querySelectorAll("[data-l10n-id]").forEach(e => {
        let id = e.attributes["data-l10n-id"].value;
        let msg = messenger.i18n.getMessage(id);
        e.innerHTML = msg;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    localize();

    messenger.storage.local.get("inputChar").then(r => {
        document.querySelector("#inputChar").checked = r.inputChar === "on";
    });

    document.querySelector("#inputChar").addEventListener("change", e => {
        e.preventDefault();
        messenger.storage.local.set({
            inputChar: document.querySelector("#inputChar").checked ? "on" : "off"
        });
    });
});
