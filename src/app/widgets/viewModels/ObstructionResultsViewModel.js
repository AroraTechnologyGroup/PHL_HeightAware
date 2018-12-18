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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/support/widget", "esri/core/Accessor", "esri/core/watchUtils", "dojo/Deferred", "dstore/Memory", "esri/symbols/PolygonSymbol3D", "esri/Color", "esri/symbols/FillSymbol3DLayer", "esri/core/promiseUtils", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, widget_1, Accessor, watchUtils_1, Deferred, Memory, PolygonSymbol3D, Color, FillSymbol3DLayer, promiseUtils, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionResultsViewModel = (function (_super) {
        __extends(ObstructionResultsViewModel, _super);
        function ObstructionResultsViewModel(params) {
            var _this = _super.call(this, params) || this;
            _this.store3d = new Memory({ data: [] });
            _this.store2d = new Memory({ data: [] });
            _this.layer_viz_obj = {};
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        ObstructionResultsViewModel.prototype.onload = function () {
        };
        ObstructionResultsViewModel.prototype.create3DArray = function (features, base_height, obsHt) {
            var _this = this;
            this.layer_viz_obj = {};
            var results = features.map(function (feature) {
                var surface_msl = feature.attributes.Elev;
                var surface_agl;
                var clearance;
                surface_agl = Number((surface_msl - base_height).toFixed(1));
                clearance = Number((surface_agl - obsHt).toFixed(1));
                var layerName = feature.attributes.layerName.toLowerCase();
                var registered_layer_ids = Object.keys(_this.layer_viz_obj);
                var layer_registered = registered_layer_ids.indexOf(layerName);
                if (clearance <= 0) {
                    if (layer_registered === -1) {
                        _this.layer_viz_obj[layerName] = [true];
                    }
                    else {
                        _this.layer_viz_obj[layerName].push(true);
                    }
                }
                else {
                    if (layer_registered === -1) {
                        _this.layer_viz_obj[layerName] = [false];
                    }
                    else {
                        _this.layer_viz_obj[layerName].push(false);
                    }
                }
                return {
                    oid: feature.attributes.OBJECTID,
                    name: feature.attributes.layerName,
                    type: feature.attributes["OIS Surface Type"],
                    condition: feature.attributes["OIS Surface Condition"],
                    runwayend: feature.attributes["Runway End Designator"],
                    runway: feature.attributes["Runway Designator"],
                    elevation: surface_msl,
                    height: surface_agl,
                    clearance: clearance,
                    guidance: feature.attributes["Approach Guidance"],
                    dateacquired: feature.attributes["Date Data Acquired"],
                    description: feature.attributes.Description,
                    regulation: feature.attributes["Safety Regulation"],
                    zoneuse: feature.attributes["Zone Use"]
                };
            });
            var layer_ids = Object.keys(this.layer_viz_obj);
            layer_ids.forEach(function (id) {
                var switches = _this.layer_viz_obj[id];
                var is_visible = switches.some(function (value) {
                    return value;
                });
                var layer_viz_obj = _this.defaultLayerVisibility.find(function (obj) {
                    if (obj.id === id) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (layer_viz_obj) {
                    layer_viz_obj.def_visible = is_visible;
                }
            });
            var sorted_array = results.slice(0);
            sorted_array.sort(function (leftSide, rightSide) {
                if (leftSide.clearance < rightSide.clearance) {
                    return -1;
                }
                if (leftSide.clearance > rightSide.clearance) {
                    return 1;
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
                    date: feature.attributes["Date Data Acquired"],
                    datasource: feature.attributes["Data Source"],
                    lastupdate: feature.attributes["Last Update"]
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
        ObstructionResultsViewModel.prototype.enableGrid3dEvents = function () {
            var _this = this;
            this.grid3d_select = this.results3d_grid.on("dgrid-select", function (evt) {
                console.log(evt);
                evt.rows.forEach(function (obj) {
                    var layer_name = obj.data.name.toLowerCase();
                    var oid = parseInt(obj.data.oid);
                    if (Object.keys(_this.selected_feature_visibility).indexOf(layer_name) !== -1) {
                        var arr = _this.selected_feature_visibility[layer_name];
                        if (arr.indexOf(oid) === -1) {
                            arr.push(oid);
                        }
                    }
                    else {
                        console.log("layer not initially set in the selected feature visibility object after watching the default layer visibility");
                        _this.selected_feature_visibility[layer_name] = [oid];
                    }
                });
                _this.updateFeatureDef();
            });
            this.grid3d_deselect = this.results3d_grid.on("dgrid-deselect", function (evt) {
                console.log(evt);
                evt.rows.forEach(function (obj) {
                    var layer_name = obj.data.name.toLowerCase();
                    var oid = parseInt(obj.data.oid);
                    if (Object.keys(_this.selected_feature_visibility).indexOf(layer_name) !== -1) {
                        var arr = _this.selected_feature_visibility[layer_name];
                        var ind = arr.indexOf(oid);
                        if (ind !== -1) {
                            var removed = arr.splice(ind, 1);
                            if (arr.indexOf(oid) !== -1) {
                                console.log("The object id was not removed from the list");
                            }
                            else {
                                console.log("The object id " + oid + " was removed");
                            }
                        }
                    }
                });
                _this.updateFeatureDef();
            });
        };
        ObstructionResultsViewModel.prototype.removeGrid3dEvents = function () {
            if (this.grid3d_select) {
                this.grid3d_select.remove();
            }
            if (this.grid3d_deselect) {
                this.grid3d_deselect.remove();
            }
        };
        ObstructionResultsViewModel.prototype.enableGrid2dEvents = function () {
            var _this = this;
            this.grid2d_select = this.results2d_grid.on("dgrid-select", function (evt) {
                console.log(evt);
                evt.rows.forEach(function (obj) {
                    var layer_name = obj.data.layerName.toLowerCase();
                    var oid = parseInt(obj.data.oid);
                    var layer = _this.scene.findLayerById(layer_name);
                    _this.view.whenLayerView(layer).then(function (layer_view) {
                        if (_this.highlight2d) {
                            _this.highlight2d.remove();
                        }
                        _this.highlight2d = layer_view.highlight(oid);
                    });
                });
            });
            this.grid2d_deselect = this.results2d_grid.on("dgrid-deselect", function (evt) {
                console.log(evt);
                evt.rows.forEach(function (obj) {
                    if (_this.highlight2d) {
                        _this.highlight2d.remove();
                    }
                });
            });
        };
        ObstructionResultsViewModel.prototype.removeGrid2dEvents = function () {
            if (this.grid2d_select) {
                this.grid2d_select.remove();
            }
            if (this.grid2d_deselect) {
                this.grid2d_deselect.remove();
            }
        };
        ObstructionResultsViewModel.prototype.updateFeatureDef = function () {
            var _this = this;
            var selViz = this.selected_feature_visibility;
            var sel_pop = false;
            Object.keys(selViz).forEach(function (key) {
                var layer = _this.scene.findLayerById(key.toLowerCase());
                if (selViz[key].length) {
                    var oid_string = selViz[key].join(",");
                    var def_string = "OBJECTID IN (" + oid_string + ")";
                    layer.definitionExpression = def_string;
                    _this.set3DSymbols(layer, true);
                    layer.visible = true;
                    sel_pop = true;
                }
                else {
                    var def_string = 'OBJECTID IS NULL';
                    layer.definitionExpression = def_string;
                    layer.visible = false;
                }
            });
            if (!sel_pop) {
                this.getDefaultLayerVisibility();
            }
        };
        ObstructionResultsViewModel.prototype.getDefaultLayerVisibility = function () {
            var _this = this;
            var group_layers = ["critical_3d", "part_77_group"];
            var deferred = promiseUtils.eachAlways(group_layers.map(function (layer_id) {
                var group_layer = _this.scene.findLayerById(layer_id);
                return promiseUtils.eachAlways(group_layer.layers.map(function (lyr) {
                    var deferred = new Deferred();
                    if (lyr.type === "feature") {
                        _this.view.whenLayerView(lyr).then(function (lyr_view) {
                            watchUtils_1.whenFalseOnce(lyr_view, "visible", function (result) {
                                deferred.resolve(result);
                            });
                        });
                        lyr.visible = false;
                    }
                    else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                }));
            }));
            deferred.then(function (results) {
                _this.defaultLayerVisibility.forEach(function (obj) {
                    var target_layer = _this.scene.findLayerById(obj.id);
                    target_layer.definitionExpression = obj.def_exp;
                    _this.set3DSymbols(target_layer, false);
                    _this.view.whenLayerView(target_layer).then(function (lyr_view) {
                        watchUtils_1.whenTrueOnce(lyr_view, "visible", function (result) {
                            return result;
                        });
                    });
                    target_layer.visible = obj.def_visible;
                });
            });
        };
        ObstructionResultsViewModel.prototype.set3DSymbols = function (layer, fill) {
            var renderer_type = layer.renderer.type;
            var current_renderer;
            var symbol_fill = new Color({
                r: 0,
                g: 0,
                b: 0,
                a: 0
            });
            if (renderer_type === "simple") {
                var outline_color = void 0;
                current_renderer = layer.renderer;
                var symbol = current_renderer.symbol;
                if (symbol.type === "simple-fill") {
                    outline_color = symbol.outline.color;
                    if (fill) {
                        symbol_fill = outline_color;
                    }
                }
                else {
                    var first_layer = symbol.symbolLayers.getItemAt(0);
                    outline_color = first_layer.outline.color;
                    if (fill) {
                        symbol_fill = outline_color;
                    }
                }
                var new_renderer = {
                    type: "simple",
                    symbol: {
                        type: "polygon-3d",
                        symbolLayers: [{
                                type: "fill",
                                material: { color: symbol_fill },
                                outline: { color: outline_color, size: "5px" }
                            }]
                    }
                };
                layer.set("renderer", new_renderer);
            }
            else if (renderer_type === "unique-value") {
                current_renderer = layer.renderer;
                var infos = current_renderer.uniqueValueInfos;
                var is3D_1 = infos.some(function (info) {
                    var current_symbol = info.symbol;
                    var current_type = current_symbol.type;
                    if (current_type === "polygon-3d") {
                        return true;
                    }
                });
                var new_infos_1 = [];
                var outline_color_1;
                infos.forEach(function (info) {
                    var value = info.value;
                    if (!is3D_1) {
                        var current_symbol = info.symbol;
                        outline_color_1 = current_symbol.outline.color;
                        if (fill) {
                            symbol_fill = outline_color_1;
                        }
                    }
                    else {
                        var current_symbol = info.symbol;
                        var first_layer = current_symbol.symbolLayers.getItemAt(0);
                        outline_color_1 = first_layer.outline.color;
                        if (fill) {
                            symbol_fill = outline_color_1;
                        }
                    }
                    var info_symbol = new PolygonSymbol3D({
                        symbolLayers: [new FillSymbol3DLayer({
                                material: { color: symbol_fill },
                                outline: { color: outline_color_1, size: "5px" }
                            })]
                    });
                    new_infos_1.push({
                        value: value,
                        symbol: info_symbol,
                        label: info.label
                    });
                });
                var new_renderer = {
                    type: "unique-value",
                    field: current_renderer.field,
                    defaultSymbol: current_renderer.defaultSymbol,
                    uniqueValueInfos: new_infos_1
                };
                layer.set("renderer", new_renderer);
            }
            if (fill) {
                layer.opacity = 0.75;
            }
            else {
                layer.opacity = 1;
            }
            return layer;
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
        ], ObstructionResultsViewModel.prototype, "ground_elevation", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "elevation_change", void 0);
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
        ], ObstructionResultsViewModel.prototype, "selected_feature_visibility", void 0);
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
        ], ObstructionResultsViewModel.prototype, "defaultLayerVisibility", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "expand", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "store3d", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "store2d", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "highlight2d", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "grid3d_select", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "grid3d_deselect", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "grid2d_select", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "grid2d_deselect", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResultsViewModel.prototype, "layer_viz_obj", void 0);
        ObstructionResultsViewModel = __decorate([
            decorators_1.subclass("widgets.App.ObstructionViewModel")
        ], ObstructionResultsViewModel);
        return ObstructionResultsViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = ObstructionResultsViewModel;
});
//# sourceMappingURL=ObstructionResultsViewModel.js.map