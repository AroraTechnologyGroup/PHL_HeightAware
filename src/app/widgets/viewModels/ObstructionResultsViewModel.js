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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/support/widget", "esri/core/Accessor", "esri/core/watchUtils", "dojo/_base/array", "dojo/dom-attr", "dojo/on", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, widget_1, Accessor, watchUtils_1, Array, domAttr, on, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionResultsViewModel = (function (_super) {
        __extends(ObstructionResultsViewModel, _super);
        function ObstructionResultsViewModel(params) {
            var _this = _super.call(this, params) || this;
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        ObstructionResultsViewModel.prototype.onload = function () {
        };
        ObstructionResultsViewModel.prototype.row_hover_funct = function (evt, id) {
            var layerName = domAttr.get(evt.currentTarget, "data-layername");
            var layerID = layerName.toLowerCase().replace(" ", "_");
            var target_layer = this.scene.findLayerById(layerID);
            target_layer.definitionExpression = "OBJECTID = " + id;
            this.setSingleLayerVisible(target_layer);
        };
        ObstructionResultsViewModel.prototype.build3dTableConnections = function (table_body, table_rows) {
            var _this = this;
            console.log(table_rows);
            if (this.displayMode === "hover") {
                if (!this.tableLeaveEvt) {
                    this.tableLeaveEvt = on(table_body, "mouseleave", function (evt) {
                        _this.getDefaultLayerVisibility();
                    });
                }
                table_rows.forEach(function (arr) {
                    var row = arr[1];
                    var _switch = arr[0];
                    var row_hover = on(row, "mouseenter", function (evt) {
                        var id = evt.target.id.split("_")[0];
                        _this.row_hover_funct(evt, id);
                    });
                    if (!_this.rowHoverEvts) {
                        _this.set("rowHoverEvts", [row_hover]);
                    }
                    else {
                        _this.rowHoverEvts.push(row_hover);
                    }
                    on(_switch, "click", function (evt) {
                        if (evt.target.checked) {
                            _this.set("display_mode", "toggle");
                            _this.build3dTableConnections(table_body, table_rows);
                        }
                        else {
                            var any_checked = Array.some(table_rows, function (arr) {
                                var _switch = arr[0];
                                if (_switch.checked) {
                                    return true;
                                }
                            });
                            if (!any_checked) {
                                _this.set("display_mode", "hover");
                                _this.build3dTableConnections(table_body, table_rows);
                            }
                        }
                    });
                });
            }
            else if (this.displayMode === "toggle") {
                if (this.tableLeaveEvt) {
                    this.tableLeaveEvt.remove();
                    this.tableLeaveEvt = undefined;
                }
                this.rowHoverEvts.forEach(function (obj) {
                    obj.remove();
                });
                this.rowHoverEvts = [];
            }
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
        ObstructionResultsViewModel.prototype.generateResultsGrid2D = function (layerResults2d) {
        };
        ObstructionResultsViewModel.prototype.highlight2DRow = function (evt, _obj, _highlight) {
            var layerName = domAttr.get(evt.currentTarget, "data-layername");
            var layerID = layerName.toLowerCase().replace(" ", "_");
            var target_layer = this.scene.findLayerById(layerID);
            var highlight = _highlight;
            this.view.whenLayerView(target_layer).then(function (lyrView) {
                if (highlight) {
                    highlight.remove();
                }
                highlight = lyrView.highlight(Number(_obj.oid));
            });
            return highlight;
        };
        ObstructionResultsViewModel.prototype.create3DArray = function (features, base_height, obsHt) {
            var results = features.map(function (feature) {
                var surface_elevation = feature.attributes.Elev;
                var height_agl;
                var clearance;
                height_agl = Number((surface_elevation - base_height).toFixed(1));
                clearance = Number((height_agl - obsHt).toFixed(1));
                return {
                    oid: feature.attributes.OBJECTID,
                    layerName: feature.attributes.layerName,
                    surface: feature.attributes.Name,
                    type: feature.attributes["OIS Surface Type"],
                    condition: feature.attributes["OIS Surface Condition"],
                    runway: feature.attributes["Runway Designator"],
                    elevation: surface_elevation,
                    height: height_agl,
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
            return sorted_array;
        };
        ObstructionResultsViewModel.prototype.getDefaultLayerVisibility = function () {
            var _this = this;
            var default_vis = this.layerVisibility;
            this.layerVisibility.forEach(function (obj) {
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
        ], ObstructionResultsViewModel.prototype, "peak", void 0);
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
        ], ObstructionResultsViewModel.prototype, "layerVisibility", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "rowHoverEvts", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "tableLeaveEvt", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "expand", void 0);
        ObstructionResultsViewModel = __decorate([
            decorators_1.subclass("widgets.App.ObstructionViewModel")
        ], ObstructionResultsViewModel);
        return ObstructionResultsViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = ObstructionResultsViewModel;
});
//# sourceMappingURL=ObstructionResultsViewModel.js.map