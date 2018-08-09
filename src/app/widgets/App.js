define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/geometry/SpatialReference", "esri/views/SceneView", "esri/widgets/LayerList", "./viewModels/AppViewModel", "./CameraPane", "./FilePane", "./LegendPane", "./MeasurePane", "./ObstructionPane", "./RunwayPane"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1, SpatialReference, SceneView, LayerList, AppViewModel_1, CameraPane_1, FilePane_1, LegendPane_1, MeasurePane_1, ObstructionPane_1, RunwayPane_1) {
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
        App.prototype.defineActions = function (event) {
            var item = event.item;
            item.actionsSections = [
                [{
                        title: "Increase opacity",
                        className: "esri-icon-up",
                        id: "increase-opacity"
                    }, {
                        title: "Decrease opacity",
                        className: "esri-icon-down",
                        id: "decrease-opacity"
                    }]
            ];
        };
        App.prototype.onAfterCreate = function (element) {
            var _this = this;
            new Promise(function (resolve_1, reject_1) { require(["../data/app"], resolve_1, reject_1); }).then(function (_a) {
                var scene = _a.scene;
                _this.map = scene;
                _this.view = new SceneView({
                    map: _this.map,
                    container: element,
                    viewingMode: "local",
                    camera: {
                        position: {
                            latitude: 189581.02732170673,
                            longitude: 2662132.296885337,
                            z: 6475.013010584819,
                            spatialReference: new SpatialReference({
                                wkid: 2272
                            })
                        },
                        tilt: 67.99509223958297,
                        heading: 24.319623182568122
                    },
                    popup: {
                        actions: [],
                        title: "Results of Obstruction Analysis",
                        dockEnabled: true,
                        spinnerEnabled: true,
                        dockOptions: {
                            buttonEnabled: true,
                            breakpoint: false,
                            position: "bottom-right"
                        }
                    }
                });
                _this.view.when(function () {
                    var layerList = new LayerList({
                        view: _this.view,
                        listItemCreatedFunction: _this.defineActions.bind(_this)
                    });
                    layerList.on("trigger-action", function (event) {
                        var id = event.action.id;
                        if (id === "increase-opacity") {
                            if (event.item.layer.opacity < 1) {
                                event.item.layer.opacity += 0.10;
                            }
                        }
                        else if (id === "decrease-opacity") {
                            if (event.item.layer.opacity > 0) {
                                event.item.layer.opacity -= 0.10;
                            }
                        }
                    });
                    _this.view.ui.add(layerList, "bottom-left");
                    var obstruction_pane = new ObstructionPane_1.ObstructionPane();
                    _this.view.ui.add(obstruction_pane, "top-right");
                    var measure_pane = new MeasurePane_1.MeasurePane();
                    _this.view.ui.add(measure_pane, "top-right");
                    var runway_pane = new RunwayPane_1.RunwayPane();
                    _this.view.ui.add(runway_pane, "top-right");
                    var legend_pane = new LegendPane_1.LegendPane();
                    _this.view.ui.add(legend_pane, "top-right");
                    var file_pane = new FilePane_1.FilePane();
                    _this.view.ui.add(file_pane, "top-right");
                    var camera_pane = new CameraPane_1.CameraPane();
                    _this.view.ui.add(camera_pane, "top-right");
                });
            });
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], App.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], App.prototype, "map", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], App.prototype, "view", void 0);
        App = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.sceneview")
        ], App);
        return App;
    }(decorators_1.declared(Widget)));
    exports.default = App;
});
//# sourceMappingURL=App.js.map