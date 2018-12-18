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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/watchUtils", "esri/widgets/LayerList", "esri/widgets/Expand", "esri/widgets/Legend", "esri/widgets/Home", "../CameraPane", "esri/geometry", "../ObstructionPane", "../ObstructionResults", "../Disclaimer", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, Accessor, watchUtils_1, LayerList, Expand, Legend, Home, CameraPane_1, geometry_1, ObstructionPane_1, ObstructionResults_1, Disclaimer_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AppViewModel = (function (_super) {
        __extends(AppViewModel, _super);
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
                content: disclaimer,
                mode: "drawer"
            });
            this.view.ui.add(disclaimerExpand, "bottom-left");
            disclaimer.set("drawer", disclaimerExpand);
            disclaimerExpand.expand();
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
                expandIconClass: "esri-icon-layers",
                expandTooltip: "Expand LayerList",
                view: this.view,
                content: layerList
            });
            this.view.ui.add(layerListExpand, "bottom-left");
            var obstruction_results = new ObstructionResults_1.ObstructionResults({
                view: this.view,
                id: "ObstructionResults",
                scene: this.scene
            });
            var obstruction_pane = this.obstructionPane = new ObstructionPane_1.ObstructionPane({
                scene: this.scene,
                view: this.view,
                results: obstruction_results
            });
            var obstructionExpand = new Expand({
                expandIconClass: "esri-icon-organization",
                expandTooltip: "Expand Obstruction Input",
                view: this.view,
                content: obstruction_pane
            });
            this.view.ui.add(obstructionExpand, "top-right");
            obstructionExpand.expand();
            var resultsExpand = new Expand({
                expandIconClass: "esri-icon-organization",
                expandTooltip: "Expand Obsruction Results",
                view: this.view,
                content: obstruction_results
            });
            this.view.ui.add(resultsExpand, "bottom-right");
            obstruction_results.expand = resultsExpand;
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
        };
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "scene", void 0);
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "obstructionPane", void 0);
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "disclaimer", void 0);
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "layerList", void 0);
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "legend", void 0);
        __decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "cameraPane", void 0);
        AppViewModel = __decorate([
            decorators_1.subclass("widgets.App.AppViewModel")
        ], AppViewModel);
        return AppViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = AppViewModel;
});
//# sourceMappingURL=AppViewModel.js.map