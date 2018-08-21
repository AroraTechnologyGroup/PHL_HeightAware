define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./viewModels/CameraViewModel", "dojo/dom", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, CameraViewModel_1, dom, widget_1) {
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
        CameraPane.prototype.onAfterCreate = function () {
            var _this = this;
            var heading = dom.byId("camera_heading");
            var camera_tilt = dom.byId("camera_tilt");
            var camera_x = dom.byId("camera_X");
            var camera_y = dom.byId("camera_Y");
            var camera_z = dom.byId("camera_Z");
            this.view.when(function () {
                _this.view.on("pointer-move", function (e) {
                    var camera = _this.view.camera;
                    heading.value = camera.heading.toFixed(3);
                    camera_tilt.value = camera.tilt.toFixed(3);
                    camera_x.value = camera.position.x.toFixed(3);
                    camera_y.value = camera.position.y.toFixed(3);
                    camera_z.value = camera.position.z.toFixed(1);
                });
            });
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
                            widget_1.tsx("div", { class: "column-2", bind: this, afterCreate: this.onAfterCreate },
                                widget_1.tsx("div", { class: "camera_label" }, "Heading:"),
                                widget_1.tsx("input", { id: "camera_heading" }),
                                widget_1.tsx("div", { class: "camera_label" }, "Tilt:"),
                                widget_1.tsx("input", { id: "camera_tilt" }),
                                widget_1.tsx("div", { class: "camera_label" }, "Eastings:"),
                                widget_1.tsx("input", { id: "camera_X" }),
                                widget_1.tsx("div", { class: "camera_label" }, "Northings:"),
                                widget_1.tsx("input", { id: "camera_Y" }),
                                widget_1.tsx("div", { class: "camera_label" }, "Camera Height:"),
                                widget_1.tsx("input", { id: "camera_Z" })))))));
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