function Emoji(options) {
    "use strict";

    var localStorage = options.localStorage;
    var emoji;
    var tone = "tone-0";
    var tab = "people";
    var categoryClasses = "people nature food activity travel objects symbols flags search modifier regional";

    function initialize(reason) {
        setTone(tone);
        attachEventHandlers();
        loadEmoji(function () {
            gotoTab(tab);
        });
    }

    localStorage.getItem("tab", function (r) {
        tab = r.tab || "people";
        localStorage.getItem("tone", function (r) {
            tone = r.tone || "tone-0";
            initialize();
        });
    });

    function gotoTab(tab) {
        if (tab === "history") $("#history").click();
        else $('#tabs a.' + tab).click();
    }

    function attachEventHandlers() {
        $("#tabs a").not("#history").on("click", handleCategoryClick);
        $("#tones a").on("click", handleToneClick);
        $("#search input").on("input", handleSearchChange);
        $("#galleries").on("click", handleEmojiClick);
        $("#history").on("click", handleHistoryClick);
    }

    function handleHistoryClick(e) {
        $("#tabs a").removeClass("active");
        $(this).addClass("active");

        getHistory(function (history) {
            var gallery = $("#history-gallery");
            gallery.empty();
            var fragment = document.createDocumentFragment();
            var h = Object.entries(history);

            h.sort((a, b) => b[1] - a[1]);
            h.map(kv => Object.entries(emoji).find(e => e[0] === kv[0]))
                .filter(e => e !== undefined)
                .forEach(e => fragment.appendChild(options.createEmojiImage({ Key: e[0], Value: e[1] })));

            document.getElementById("history-gallery").appendChild(fragment);
            $("#galleries").removeClass().addClass("history");
            localStorage.setItem("tab", "history");
        });

        //e.preventDefault();
    }

    function convertUnicodeToString(unicode) {
        var hi, lo;
        if (unicode.indexOf("-") > -1) {
            var parts = [];
            var s = unicode.split('-');
            for (var i = 0; i < s.length; i++) {
                var part = parseInt(s[i], 16);
                if (part >= 0x10000 && part <= 0x10FFFF) {
                    hi = Math.floor((part - 0x10000) / 0x400) + 0xD800;
                    lo = (part - 0x10000) % 0x400 + 0xDC00;
                    part = String.fromCharCode(hi) + String.fromCharCode(lo);
                }
                else {
                    part = String.fromCharCode(part);
                }
                parts.push(part);
            }
            return parts.join('');
        }
        else {
            var u = parseInt(unicode, 16);
            if (u >= 0x10000 && u <= 0x10FFFF) {
                hi = Math.floor((u - 0x10000) / 0x400) + 0xD800;
                lo = (u - 0x10000) % 0x400 + 0xDC00;
                return String.fromCharCode(hi) + String.fromCharCode(lo);
            }
            else {
                return String.fromCharCode(u);
            }
        }
    }

    async function handleEmojiClick(e) {
        var target = $(e.target).closest("[data-codepoint]");
        if (target.length > 0) {
            var unicode = target.attr("data-codepoint");
            var id = target.attr("id");
            var emoji = convertUnicodeToString(unicode);
            await options.insertText(id, emoji, e.shiftKey);
            storeHistory(id);
        }
        //e.preventDefault();
    }

    function handleSearchChange(e) {
        var qs = $(this).val().toLowerCase().split(/[^a-z0-9]+/).filter(q => q.length >= 2);

        if (qs.length < 1) return;

        $("#emoji-gallery").removeClass(categoryClasses).addClass("search");
        $("#emoji-gallery .joypixels").removeClass("match");

        Object.entries(emoji)
            .filter(e => qs.filter(q => {
                let v = e[1];
                return v.name.indexOf(q) >= 0
                    || v.shortname.indexOf(q) >= 0
                    || v.keywords.filter(k => k.indexOf(q) >= 0).length > 0;
            }).length > 0)
            .forEach(e => $(document.getElementsByClassName("_" + e[0])).addClass("match"));

        $("#galleries").removeClass().addClass("emoji");
        $("#tabs a").removeClass("active");
    }

    function handleToneClick(e) {
        var tone = this.className;
        localStorage.setItem("tone", tone);
        setTone(tone);
        //e.preventDefault();
    }

    function getHistory(resolve) {
        localStorage.getItem("emoji", function (r) {
            if (!r.emoji) resolve({});
            else {
                try {
                    var history = JSON.parse(r.emoji) || {};
                    resolve(history);
                } catch (e) {
                    resolve({});
                }
            }
        });
    }

    function storeHistory(unicode) {
        getHistory(function (history) {
            history[unicode] = (history[unicode] || 0) + 1;
            let h = Object.entries(history);
            h.sort((a, b) => b[1] - a[1]);
            let newHistory = Object.fromEntries(h.slice(0, 100));
            localStorage.setItem("emoji", JSON.stringify(newHistory));
        });
    }

    function setTone(tone) {
        $("#emoji-gallery").removeClass("tone-0 tone-1 tone-2 tone-3 tone-4 tone-5").addClass(tone);
        $("#tones a").removeClass("active");
        $('#tones a.' + tone).addClass("active");
    }

    function handleCategoryClick(e) {
        var category = this.className;
        $("#tabs a").removeClass("active");
        $(this).addClass("active");
        $("#emoji-gallery").removeClass(categoryClasses).addClass(category);
        $("#galleries").removeClass().addClass("emoji");
        localStorage.setItem("tab", category);
        //e.preventDefault();
    }

    function processEmojiObject(e) {
        const groupBy = (x,f)=>x.reduce((a,b)=>((a[f(b)]||=[]).push(b),a),{});
        emoji = e;
        var fragment = document.createDocumentFragment();
        let groups = Object.entries(groupBy(Object.entries(emoji), e => e[1].shortname.replace(/_tone\d/, '')));
        groups.sort((a, b) => a[1][0][1].order - b[1][0][1].order);
        groups
            .map(a => {
                let g = a[1];
                if (g.length > 1) g.forEach(e => {
                    let v = e[1];
                    var match = /_tone(\d)/.exec(v.shortname);
                    v.tone = match !== null ? match[1] : "0";
                });
                return g;
            })
            .flat()
            .forEach(e => {
                fragment.appendChild(options.createEmojiImage({ Key: e[0], Value: e[1] }));
            });
        
        document.getElementById("emoji-gallery").appendChild(fragment);
    }

    function loadEmoji(doneCallback) {
        $.ajax({
            dataType: "json",
            url: "emoji.json",
            mimeType: "application/json",
            success: processEmojiObject
        }).done(doneCallback);
    }
}
