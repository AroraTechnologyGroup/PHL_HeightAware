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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/support/widget", "esri/core/Accessor", "esri/core/watchUtils", "dstore/Memory", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, widget_1, Accessor, watchUtils_1, Memory, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionResultsViewModel = (function (_super) {
        __extends(ObstructionResultsViewModel, _super);
        function ObstructionResultsViewModel(params) {
            var _this = _super.call(this, params) || this;
            _this.store3d = new Memory({ data: [] });
            _this.store2d = new Memory({ data: [] });
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        ObstructionResultsViewModel.prototype.onload = function () {
        };
        ObstructionResultsViewModel.prototype.setSingleLayerVisible = function (visible_layer) {
            var part77_group = this.scene.findLayerById("part_77_group");
            var critical_3d = this.scene.findLayerById("critical_3d");
            visible_layer.visible = true;
            critical_3d.layers.forEach(function (lyr) {
                if (lyr.id !== visible_layer.id) {
                    lyr.visible = false;
                }
            });
            part77_group.layers.forEach(function (lyr) {
                if (lyr.id !== visible_layer.id) {
                    lyr.visible = false;
                }
            });
        };
        ObstructionResultsViewModel.prototype.create3DArray = function (features, base_height, obsHt) {
            var results = features.map(function (feature) {
                var surface_msl = feature.attributes.Elev;
                var surface_agl;
                var clearance;
                surface_agl = Number((surface_msl - base_height).toFixed(1));
                clearance = Number((surface_agl - obsHt).toFixed(1));
                return {
                    oid: feature.attributes.OBJECTID,
                    name: feature.attributes.layerName,
                    type: feature.attributes["OIS Surface Type"],
                    condition: feature.attributes["OIS Surface Condition"],
                    runway: feature.attributes["Runway Designator"],
                    elevation: surface_msl,
                    height: surface_agl,
                    clearance: clearance,
                    guidance: feature.attributes["Approach Guidance"],
                    date_acquired: feature.attributes["Date Data Acquired"],
                    description: feature.attributes.Description,
                    regulation: feature.attributes["Safety Regulation"],
                    zone_use: feature.attributes["Zone Use"]
                };
            });
            var sorted_array = results.slice(0);
            sorted_array.sort(function (leftSide, rightSide) {
                if (leftSide.clearance < rightSide.clearance) {
                    return 1;
                }
                if (leftSide.clearance > rightSide.clearance) {
                    return -1;
                }
                return 0;
            });
            this.store3d.setData(sorted_array);
            return sorted_array;
        };
        ObstructionResultsViewModel.prototype.create2DArray = function (features) {
            var results = features.map(function (feature) {
                return ({
                    oid: feature.attributes.OBJECTID,
                    layerName: feature.attributes.layerName,
                    name: feature.attributes.Name,
                    description: feature.attributes.Description,
                    date_acquired: feature.attributes["Date Data Acquired"],
                    data_source: feature.attributes["Data Source"],
                    last_update: feature.attributes["Last Update"]
                });
            });
            var sorted_array = results.slice(0);
            sorted_array.sort(function (leftSide, rightSide) {
                if (leftSide.name < rightSide.name) {
                    return 1;
                }
                if (leftSide.name > rightSide.name) {
                    return -1;
                }
                return 0;
            });
            this.store2d.setData(sorted_array);
            return sorted_array;
        };
        ObstructionResultsViewModel.prototype.getDefaultLayerVisibility = function () {
            var _this = this;
            this.defaultLayerVisibility.forEach(function (obj) {
                var target_layer = _this.scene.findLayerById(obj.id);
                target_layer.visible = obj.def_visible;
                target_layer.definitionExpression = obj.def_exp;
            });
        };
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "name", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "x", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "y", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "msl", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "agl", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "groundElevation", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "dem_source", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "layerResults3d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "layerResults2d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "count_3d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "count_2d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "results3d_grid", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "results2d_grid", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "meta3d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "meta2d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "selected_visibility_3d", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "selected_visibility_2d", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "modifiedBase", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "scene", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "displayMode", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "defaultLayerVisibility", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "rowHoverEvts", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "tableLeaveEvt", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "expand", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "store3d", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "store2d", void 0);
        ObstructionResultsViewModel = __decorate([
            decorators_1.subclass("widgets.App.ObstructionViewModel")
        ], ObstructionResultsViewModel);
        return ObstructionResultsViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = ObstructionResultsViewModel;
});
//# sourceMappingURL=ObstructionResultsViewModel.js.map