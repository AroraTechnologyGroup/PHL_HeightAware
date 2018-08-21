define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/geometry/SpatialReference", "esri/views/SceneView", "esri/widgets/LayerList", "esri/widgets/Popup", "./viewModels/AppViewModel", "./CameraPane", "./FilePane", "./LegendPane", "./MeasurePane", "./ObstructionPane", "./RunwayPane", "esri/geometry"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1, SpatialReference, SceneView, LayerList, Popup, AppViewModel_1, CameraPane_1, FilePane_1, LegendPane_1, MeasurePane_1, ObstructionPane_1, RunwayPane_1, geometry_1) {
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
            if (item.layer.type === "group") {
                item.actionsSections = [[{
                            title: "Increase opacity",
                            className: "esri-icon-up",
                            id: "increase-opacity"
                        }, {
                            title: "Decrease opacity",
                            className: "esri-icon-down",
                            id: "decrease-opacity"
                        }
                    ]];
            }
            else {
                item.actionsSections = [
                    [{
                            title: "Zoom To",
                            className: "esri-icon-zoom-in-magnifying-glass",
                            id: "zoom-to-layer"
                        }, {
                            title: "Increase opacity",
                            className: "esri-icon-up",
                            id: "increase-opacity"
                        }, {
                            title: "Decrease opacity",
                            className: "esri-icon-down",
                            id: "decrease-opacity"
                        }, {
                            title: "Metadata Link",
                            className: "esri-icon-link",
                            id: "metadata-link"
                        }]
                ];
            }
        };
        App.prototype.onAfterCreate = function (element) {
            var _this = this;
            new Promise(function (resolve_1, reject_1) { require(["../data/app"], resolve_1, reject_1); }).then(function (_a) {
                var scene = _a.scene;
                _this.map = scene;
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
                var metadataAction = {
                    title: "Metadata",
                    id: "metadata-panel",
                    className: "esri-icon-question"
                };
                var obstructionAction = {
                    title: "Obstruction Results",
                    id: "obstruction-results",
                    className: "esri-icon-table"
                };
                var scene_Popup = new Popup({
                    actions: [zoomOutAction, zoomInAction, metadataAction, obstructionAction],
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
                _this.view.when(function () {
                    var layerList = new LayerList({
                        view: _this.view,
                        listItemCreatedFunction: _this.defineActions.bind(_this)
                    });
                    layerList.on("trigger-action", function (event) {
                        var id = event.action.id;
                        var layer_type = event.item.layer.geometryType;
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
                        else if (id === "zoom-to-layer") {
                            if (layer_type === "point") {
                                event.item.layerView.queryFeatures().then(function (feats) {
                                    _this.view.goTo({
                                        target: feats.features[0],
                                        tilt: _this.view.camera.tilt
                                    });
                                });
                            }
                            else {
                                if (event.item.layer.id === "obstruction_base") {
                                    event.item.layerView.queryFeatures().then(function (feats) {
                                        _this.view.goTo({
                                            target: feats.features[0],
                                            tilt: _this.view.camera.tilt
                                        });
                                    });
                                }
                                else {
                                    var ext = event.item.layer.fullExtent;
                                    _this.view.goTo({
                                        target: new geometry_1.Polygon({
                                            spatialReference: _this.view.spatialReference,
                                            rings: [
                                                [
                                                    [ext.xmin, ext.ymin],
                                                    [ext.xmin, ext.ymax],
                                                    [ext.xmax, ext.ymax],
                                                    [ext.xmax, ext.ymin],
                                                    [ext.xmin, ext.ymin]
                                                ]
                                            ]
                                        }),
                                        tilt: _this.view.camera.tilt
                                    });
                                }
                            }
                        }
                        else if (id === "metadata-link") {
                            console.log(event);
                        }
                    });
                    _this.view.ui.add(layerList, "bottom-left");
                    var obstruction_pane = new ObstructionPane_1.ObstructionPane({
                        scene: _this.map,
                        view: _this.view
                    });
                    _this.view.ui.add(obstruction_pane, "top-right");
                    var measure_pane = new MeasurePane_1.MeasurePane({
                        scene: _this.map,
                        view: _this.view
                    });
                    _this.view.ui.add(measure_pane, "top-right");
                    var runway_pane = new RunwayPane_1.RunwayPane({
                        scene: _this.map,
                        view: _this.view
                    });
                    _this.view.ui.add(runway_pane, "top-right");
                    var legend_pane = new LegendPane_1.LegendPane({
                        scene: _this.map,
                        view: _this.view
                    });
                    _this.view.ui.add(legend_pane, "top-right");
                    var file_pane = new FilePane_1.FilePane({
                        scene: _this.map,
                        view: _this.view
                    });
                    _this.view.ui.add(file_pane, "top-right");
                    var camera_pane = new CameraPane_1.CameraPane({
                        scene: _this.map,
                        view: _this.view
                    });
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