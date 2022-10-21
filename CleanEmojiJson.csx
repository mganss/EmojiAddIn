#r "nuget: Newtonsoft.Json, 13.0.1"

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

var emojis = JObject.Parse(File.ReadAllText(Args[0]));
var handshakes = new Dictionary<string, string> 
{
    ["handshake: light skin tone"] = ":handshake_tone1:",
    ["handshake: medium-light skin tone"] = ":handshake_tone2:",
    ["handshake: medium skin tone"] = ":handshake_tone3:",
    ["handshake: medium-dark skin tone"] = ":handshake_tone4:",
    ["handshake: dark skin tone"] = ":handshake_tone5:"
};

foreach (var e in emojis)
{
    var val = e.Value as JObject;
    val.Remove("display");
    val.Remove("shortname_alternates");
    val.Remove("ascii");
    val.Remove("diversity");
    val.Remove("diversities");
    val.Remove("diversity_base");
    val.Remove("diversity_children");
    val.Remove("gender");
    val.Remove("genders");
    val.Remove("gender_children");
    val.Remove("humanform");
    val["codepoint"] = val["code_points"]["fully_qualified"];
    val.Remove("code_points");
    val.Remove("unicode_version");
    e.Value["keywords"] = new JArray(e.Value["keywords"].Distinct().ToArray());

    if(handshakes.TryGetValue((string)val["name"], out var hs))
    {
        val["shortname"] = hs;
    }
}

var s = emojis.ToString(Formatting.None);
File.WriteAllText("AddInCompose/TaskPane/emoji.json", s);
File.WriteAllText("thunderbird/emoji@ganss.org/chrome/content/emoji.json", s);
