define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/geometry/SpatialReference", "esri/views/SceneView", "esri/widgets/Popup", "./viewModels/AppViewModel"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1, SpatialReference, SceneView, Popup, AppViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var App = (function (_super) {
        tslib_1.__extends(App, _super);
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
        tslib_1.__decorate([
            decorators_1.property()
        ], App.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], App.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], App.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.obstructionPane")
        ], App.prototype, "obstructionPane", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.layerList")
        ], App.prototype, "layerList", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.legend")
        ], App.prototype, "legend", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.cameraPane")
        ], App.prototype, "cameraPane", void 0);
        App = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.sceneview")
        ], App);
        return App;
    }(decorators_1.declared(Widget)));
    exports.default = App;
});
//# sourceMappingURL=App.js.map