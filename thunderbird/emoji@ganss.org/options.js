/* jshint esversion: 6 */

function localize() {
    document.querySelectorAll("[data-l10n-id]").forEach(e => {
        let id = e.attributes["data-l10n-id"].value;
        let msg = messenger.i18n.getMessage(id);
        e.textContent = msg;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    localize();
    document.documentElement.lang = messenger.i18n.getUILanguage();
    document.title = messenger.i18n.getMessage("options.title");
    const modeInputs = document.querySelectorAll("input[name='displayMode']");
    function updateChoices() {
        modeInputs.forEach(input => input.closest(".choice").classList.toggle("selected", input.checked));
    }
    messenger.storage.local.get("displayMode").then(settings => {
        document.querySelector("input[name='displayMode'][value='" + (settings.displayMode === "window" ? "window" : "popup") + "']").checked = true;
        updateChoices();
    });
    modeInputs.forEach(input => input.addEventListener("change", event => {
        updateChoices();
        messenger.storage.local.set({ displayMode: event.target.value });
    }));
    updateChoices();

    messenger.storage.local.get("inputChar").then(r => {
        document.querySelector("#inputChar").checked = r.inputChar === "on";
    });

    document.querySelector("#inputChar").addEventListener("change", e => {
        messenger.storage.local.set({
            inputChar: document.querySelector("#inputChar").checked ? "on" : "off"
        });
    });
});
