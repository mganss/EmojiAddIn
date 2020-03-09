function Emoji(options) {
    "use strict";

    var localStorage = options.localStorage;
    var emoji;
    var tone = localStorage.getItem("tone") || "tone-0";
    var tab = localStorage.getItem("tab") || "people";
    var categoryClasses = "people nature food activity travel objects symbols flags search modifier regional";

    function initialize(reason) {
        setTone(tone);
        attachEventHandlers();
        loadEmoji(function () {
            gotoTab(tab);
        });
    }

    initialize();

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
        $("#tabs,#tones,#galleries").on("mousedown", function (e) { e.preventDefault(); }); // prevent focus on sidebar
    }

    function handleHistoryClick(e) {
        $("#tabs a").removeClass("active");
        $(this).addClass("active");
        var history = getHistory();
        var gallery = $("#history-gallery");
        gallery.empty();
        var emojis = $.Enumerable.From(emoji);
        var fragment = document.createDocumentFragment();
        $.Enumerable.From(history)
            .OrderByDescending("$.Value")
            .Select(function (v) { return emojis.SingleOrDefault(null, function (e) { return e.Key === v.Key; }); })
            .Where(function (v) { return v !== null; })
            .ForEach(function (e) {
                fragment.appendChild(options.createEmojiImage(e));
            });
        document.getElementById("history-gallery").appendChild(fragment);
        $("#galleries").removeClass().addClass("history");
        localStorage.setItem("tab", "history");
        e.preventDefault();
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

    function handleEmojiClick(e) {
        var target = $(e.target).closest("[data-codepoint]");

        if (target.length > 0) {
            var unicode = target.attr("data-codepoint");
            var id = target.attr("id");
            var emoji = convertUnicodeToString(unicode);
            options.insertText(id, emoji, e.shiftKey);
            storeHistory(unicode);
        }

        e.preventDefault();
    }

    function handleSearchChange(e) {
        var qs = $.Enumerable.From($(this).val().toLowerCase().split(/[^a-z0-9]+/)).Where("$.length >= 2");

        if (qs.Count() < 1) return;

        $("#emoji-gallery").removeClass(categoryClasses).addClass("search");
        $("#emoji-gallery .joypixels").removeClass("match");
        $.Enumerable.From(emoji)
            .Where(function (e) {
                return qs.Any(function (q) {
                    return e.Value.name.indexOf(q) >= 0
                        || e.Value.shortname.indexOf(q) >= 0
                        || $.Enumerable.From(e.Value.keywords).Any(function (k) { return k.indexOf(q) >= 0; });
                });
            })
            .ForEach(function (e) {
                $(document.getElementsByClassName("_" + e.Key)).addClass("match");
            });

        $("#galleries").removeClass().addClass("emoji");
        $("#tabs a").removeClass("active");
    }

    function handleToneClick(e) {
        var tone = this.className;
        localStorage.setItem("tone", tone);
        setTone(tone);
        e.preventDefault();
    }

    function getHistory() {
        var history = JSON.parse(localStorage.getItem("emoji")) || {};
        return history;
    }

    function storeHistory(unicode) {
        var history = getHistory();
        history[unicode] = (history[unicode] || 0) + 1;
        var newHistory = $.Enumerable.From(history).OrderByDescending("$.Value").Take(50).ToObject("$.Key", "$.Value");
        localStorage.setItem("emoji", JSON.stringify(newHistory));
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
        e.preventDefault();
    }

    function processEmojiObject(e) {
        emoji = e;
        var fragment = document.createDocumentFragment();
        $.Enumerable.From(emoji)
            .GroupBy(function (e) { return e.Value.shortname.replace(/_tone\d/, ''); })
            .OrderBy(function (g) { return g.First().Value.order; })
            .SelectMany(function (g) {
                if (g.Count() > 1) g.ForEach(function (e, i) {
                    var match = /_tone(\d)/.exec(e.Value.shortname);
                    e.Value.tone = match !== null ? match[1] : "0";
                });
                return g;
            })
            .ForEach(function (e) {
                fragment.appendChild(options.createEmojiImage(e));
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
