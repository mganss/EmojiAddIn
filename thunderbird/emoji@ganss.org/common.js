/* jshint esversion: 6 */

function localize() {
    document.querySelectorAll("[data-l10n-id]").forEach(e => {
        let id = e.attributes["data-l10n-id"].value;
        let msg = messenger.i18n.getMessage(id);
        e.innerHTML = msg;
    });
}
