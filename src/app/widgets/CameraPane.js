define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./viewModels/CameraViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, CameraViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CameraPane = (function (_super) {
        tslib_1.__extends(CameraPane, _super);
        function CameraPane(params) {
            var _this = _super.call(this, params) || this;
            _this.name = "Camera Location";
            _this.viewModel = new CameraViewModel_1.default();
            return _this;
        }
        CameraPane.prototype.postInitialize = function () {
        };
        CameraPane.prototype.render = function () {
            return (widget_1.tsx("div", { id: "panelCamera", class: "panel collapse" },
                widget_1.tsx("div", { id: "headingCamera", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle collapsed", role: "button", "data-toggle": "collapse", href: "#collapseCamera", "aria-expanded": "false", "aria-controls": "collapseCamera" },
                            widget_1.tsx("span", { class: "icon-ui-locate", "aria-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", tabindex: "0", href: "#panelCamera" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseCamera", class: "panel-collapse collapse", role: "tabpanel", "aria-labelledby": "headingCamera" },
                    widget_1.tsx("div", { class: "body-light" },
                        widget_1.tsx("div", { class: "grid-container" },
                            widget_1.tsx("div", { class: "column-2" },
                                widget_1.tsx("div", { class: "camera_label" }, "Heading:"),
                                widget_1.tsx("div", { class: "camera_label" }, "Tilt:"),
                                widget_1.tsx("div", { class: "camera_label" }, "Eastings:"),
                                widget_1.tsx("div", { class: "camera_label" }, "Northings:"),
                                widget_1.tsx("div", { class: "camera_label" }, "Camera Height:")),
                            widget_1.tsx("div", { class: "col-2" },
                                widget_1.tsx("div", { id: "camera_heading" }),
                                widget_1.tsx("div", { id: "camera_tilt" }),
                                widget_1.tsx("div", { id: "camera_X" }),
                                widget_1.tsx("div", { id: "camera_Y" }),
                                widget_1.tsx("div", { id: "camera_Z" })))))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], CameraPane.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], CameraPane.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], CameraPane.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], CameraPane.prototype, "view", void 0);
        CameraPane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.camera_pane")
        ], CameraPane);
        return CameraPane;
    }(decorators_1.declared(Widget)));
    exports.CameraPane = CameraPane;
});
//# sourceMappingURL=CameraPane.js.map