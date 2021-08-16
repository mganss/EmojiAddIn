#! "netcoreapp3.1"
#r "nuget: Newtonsoft.Json, 13.0.1"

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

var emojis = JObject.Parse(File.ReadAllText(Args[0]));

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
}

var s = emojis.ToString(Formatting.None);
File.WriteAllText("AddInCompose/TaskPane/emoji.json", s);
File.WriteAllText("thunderbird/emoji@ganss.org/chrome/content/emoji.json", s);
