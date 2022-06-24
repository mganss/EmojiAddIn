// Import some things we need.
var { ExtensionCommon } = ChromeUtils.import(
  "resource://gre/modules/ExtensionCommon.jsm"
);
var { ExtensionSupport } = ChromeUtils.import(
  "resource:///modules/ExtensionSupport.jsm"
);
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var Subject = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      Subject: {
        async test() {
          console.log("test");
        }
      }
    };
  }
};
