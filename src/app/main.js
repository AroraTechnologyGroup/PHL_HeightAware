define(["require", "exports", "dojo/cookie", "./widgets/App", "@dojo/shim/Promise"], function (require, exports, cookie, App_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (!cookie("HeightAware")) {
        alert("PHL HeightAware is designed for planning purposes only and does not replace any procedures or guidance from any Airport department.");
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 1);
        var cValue = escape("This cookie controls the warning pop-up.") + ((1 === null) ? "" : "; expires=" + exdate.toUTCString());
        cookie("HeightAware", cValue);
    }
    exports.app = new App_1.default({
        container: document.getElementById("app")
    });
});
//# sourceMappingURL=main.js.map