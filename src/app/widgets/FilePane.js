define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FilePane = (function (_super) {
        tslib_1.__extends(FilePane, _super);
        function FilePane() {
            var _this = _super.call(this) || this;
            _this.name = "Batch Upload";
            return _this;
        }
        FilePane.prototype.postInitialize = function () {
        };
        FilePane.prototype.render = function () {
            return (widget_1.tsx("div", { id: "fileLoader", class: "panel collapse" },
                widget_1.tsx("div", { id: "headingLoader", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseLoader", "aria-expanded": "true", "aria-controls": "collapseLoader" },
                            widget_1.tsx("span", { class: "icon-ui-upload", "arira-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", tabindex: "0", href: "#fileLoader" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseLoader", class: "panel-collapse collapse", role: "tabpanel", "area-labeledby": "headingLoader" },
                    widget_1.tsx("div", { class: "body-light" },
                        widget_1.tsx("div", null,
                            widget_1.tsx("div", { id: "fileLoader" },
                                widget_1.tsx("form", { id: "fileform" },
                                    widget_1.tsx("div", null,
                                        widget_1.tsx("input", { type: "file", id: "file" })),
                                    widget_1.tsx("div", null,
                                        widget_1.tsx("select", { class: "pointlist", id: "pointlist" }),
                                        widget_1.tsx("input", { class: "pointlist", type: "button", value: "Update", id: "csvupdate" }))),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "submit", id: "xysubmit" }))))))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], FilePane.prototype, "name", void 0);
        FilePane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.file_pane")
        ], FilePane);
        return FilePane;
    }(decorators_1.declared(Widget)));
    exports.FilePane = FilePane;
});
//# sourceMappingURL=FilePane.js.map