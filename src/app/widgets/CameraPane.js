var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./viewModels/CameraViewModel", "dojo/dom", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, CameraViewModel_1, dom, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CameraPane = (function (_super) {
        __extends(CameraPane, _super);
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
            return (widget_1.tsx("div", { id: "panelCamera" },
                widget_1.tsx("div", { id: "headingCamera", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("span", { class: "icon-ui-mobile", "aria-hidden": "true" }),
                        widget_1.tsx("span", { class: "panel-label" }, this.name))),
                widget_1.tsx("div", null,
                    widget_1.tsx("div", null,
                        widget_1.tsx("div", { bind: this, afterCreate: this.onAfterCreate },
                            widget_1.tsx("div", { class: "camera_label" }, "Heading:"),
                            widget_1.tsx("input", { id: "camera_heading" }),
                            widget_1.tsx("div", { class: "camera_label" }, "Tilt:"),
                            widget_1.tsx("input", { id: "camera_tilt" }),
                            widget_1.tsx("div", { class: "camera_label" }, "Eastings:"),
                            widget_1.tsx("input", { id: "camera_X" }),
                            widget_1.tsx("div", { class: "camera_label" }, "Northings:"),
                            widget_1.tsx("input", { id: "camera_Y" }),
                            widget_1.tsx("div", { class: "camera_label" }, "Camera Height:"),
                            widget_1.tsx("input", { id: "camera_Z" }))))));
        };
        __decorate([
            decorators_1.property()
        ], CameraPane.prototype, "name", void 0);
        __decorate([
            decorators_1.property()
        ], CameraPane.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], CameraPane.prototype, "scene", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], CameraPane.prototype, "view", void 0);
        CameraPane = __decorate([
            decorators_1.subclass("app.widgets.camera_pane")
        ], CameraPane);
        return CameraPane;
    }(decorators_1.declared(Widget)));
    exports.CameraPane = CameraPane;
});
//# sourceMappingURL=CameraPane.js.map