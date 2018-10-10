define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/Accessor", "esri/core/watchUtils", "esri/widgets/LayerList", "esri/widgets/Expand", "esri/widgets/Legend", "esri/widgets/Home", "esri/widgets/CoordinateConversion", "../CameraPane", "esri/geometry", "../ObstructionPane", "../Disclaimer", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, tslib_1, Accessor, watchUtils_1, LayerList, Expand, Legend, Home, CoordinateConversion, CameraPane_1, geometry_1, ObstructionPane_1, Disclaimer_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AppViewModel = (function (_super) {
        tslib_1.__extends(AppViewModel, _super);
        function AppViewModel(params) {
            var _this = _super.call(this, params) || this;
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        AppViewModel.prototype.defineActions = function (event) {
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
        AppViewModel.prototype.onload = function () {
            var _this = this;
            var disclaimer = this.disclaimer = new Disclaimer_1.Disclaimer({
                view: this.view
            });
            var disclaimerExpand = new Expand({
                expandIconClass: "esri-icon-description",
                expandTooltip: "Expand Site Description",
                view: this.view,
                content: disclaimer
            });
            this.view.ui.add(disclaimerExpand, "bottom-left");
            var layerList = this.layerList = new LayerList({
                container: document.createElement("div"),
                view: this.view,
                listItemCreatedFunction: this.defineActions.bind(this)
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
                    var url = event.item.layer.url + "/info/metadata";
                    open(url, "_blank");
                }
            });
            var layerListExpand = new Expand({
                expandIconClass: "esri-icon-layer-list",
                expandTooltip: "Expand LayerList",
                view: this.view,
                content: layerList
            });
            this.view.ui.add(layerListExpand, "bottom-left");
            var obstruction_pane = this.obstructionPane = new ObstructionPane_1.ObstructionPane({
                scene: this.scene,
                view: this.view
            });
            var obstructionExpand = new Expand({
                expandIconClass: "esri-icon-organization",
                expandTooltip: "Expand Obstruction Pane",
                view: this.view,
                content: obstruction_pane
            });
            this.view.ui.add(obstructionExpand, "bottom-left");
            var legend_pane = this.legend = new Legend({
                view: this.view
            });
            var legendExpand = new Expand({
                expandIconClass: "esri-icon-key",
                expandTooltip: "Expand LayerLegend",
                view: this.view,
                content: legend_pane
            });
            this.view.ui.add(legendExpand, "bottom-left");
            var camera_pane = this.cameraPane = new CameraPane_1.CameraPane({
                scene: this.scene,
                view: this.view
            });
            var cameraExpand = new Expand({
                expandIconClass: "esri-icon-mobile",
                expandTooltip: "Expand Camera Location",
                view: this.view,
                content: camera_pane
            });
            this.view.ui.add(cameraExpand, "bottom-left");
            var home_btn = new Home({
                view: this.view
            });
            this.view.ui.add(home_btn, "top-left");
            var ccWidget = new CoordinateConversion({
                view: this.view
            });
            var ccExpand = new Expand({
                expandIconClass: "esri-icon-applications",
                expandTooltip: "Expand Coordinate Creator",
                view: this.view,
                content: ccWidget
            });
            this.view.ui.add(ccExpand, "bottom-right");
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "obstructionPane", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "disclaimer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "layerList", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "legend", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "cameraPane", void 0);
        AppViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.AppViewModel")
        ], AppViewModel);
        return AppViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = AppViewModel;
});
//# sourceMappingURL=AppViewModel.js.map