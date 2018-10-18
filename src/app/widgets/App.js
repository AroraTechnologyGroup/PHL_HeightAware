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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/geometry/SpatialReference", "esri/views/SceneView", "esri/widgets/Popup", "./viewModels/AppViewModel"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, SpatialReference, SceneView, Popup, AppViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function (_super) {
        __extends(App, _super);
        function App(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new AppViewModel_1.default();
            return _this;
        }
        App.prototype.render = function () {
            return (widget_1.tsx("div", { class: "calcite-map calcite-map-absolute" },
                widget_1.tsx("div", { id: "map", bind: this, afterCreate: this.onAfterCreate })));
        };
        App.prototype.onAfterCreate = function (element) {
            var _this = this;
            new Promise(function (resolve_1, reject_1) { require(["../data/app"], resolve_1, reject_1); }).then(function (_a) {
                var scene = _a.scene;
                _this.scene = scene;
                var zoomOutAction = {
                    title: "Zoom out",
                    id: "zoom-out",
                    className: "esri-icon-zoom-out-magnifying-glass"
                };
                var zoomInAction = {
                    title: "Zoom in",
                    id: "zoom-in",
                    className: "esri-icon-zoom-in-magnifying-glass"
                };
                var scene_Popup = new Popup({
                    actions: [zoomOutAction, zoomInAction],
                    dockEnabled: true,
                    spinnerEnabled: true,
                    autoCloseEnabled: true,
                    dockOptions: {
                        buttonEnabled: false,
                        breakpoint: false,
                        position: "bottom-right"
                    }
                });
                _this.view = new SceneView({
                    map: _this.scene,
                    container: element,
                    viewingMode: "local",
                    camera: {
                        position: {
                            latitude: 199790.871,
                            longitude: 2679814.346,
                            z: 1794.0,
                            spatialReference: new SpatialReference({
                                wkid: 6565
                            })
                        },
                        tilt: 77.623,
                        heading: 318.096
                    },
                    popup: scene_Popup
                });
                _this.view.popup.on("trigger-action", function (event) {
                    if (event.action.id === "zoom-out") {
                        _this.view.goTo({
                            center: _this.view.center,
                            zoom: _this.view.zoom - 2
                        });
                    }
                    else if (event.action.id === "zoom-in") {
                        _this.view.goTo({
                            center: _this.view.center,
                            zoom: _this.view.zoom + 2
                        });
                    }
                });
            });
        };
        __decorate([
            decorators_1.property()
        ], App.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], App.prototype, "scene", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], App.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.obstructionPane")
        ], App.prototype, "obstructionPane", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerList")
        ], App.prototype, "layerList", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.legend")
        ], App.prototype, "legend", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.cameraPane")
        ], App.prototype, "cameraPane", void 0);
        App = __decorate([
            decorators_1.subclass("app.widgets.sceneview")
        ], App);
        return App;
    }(decorators_1.declared(Widget)));
    exports.default = App;
});
//# sourceMappingURL=App.js.map