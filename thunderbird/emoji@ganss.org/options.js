/* jshint esversion: 6 */

document.addEventListener("DOMContentLoaded", () => {
    localize();

    messenger.storage.sync.get("inputChar").then(r => {
        document.querySelector("#inputChar").checked = r.inputChar === "on";
    });

    document.querySelector("#inputChar").addEventListener("change", e => {
        e.preventDefault();
        messenger.storage.sync.set({
            inputChar: document.querySelector("#inputChar").checked ? "on" : "off"
        });
    });
});
