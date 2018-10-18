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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/support/widget", "esri/core/Accessor", "esri/core/watchUtils", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class", "dojo/dom-attr", "dojo/on", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, widget_1, Accessor, watchUtils_1, Array, domConstruct, domClass, domAttr, on, decorators_1) {
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
        ObstructionResultsViewModel.prototype.buildPopup = function (layerResults3d, layerResults2d, base_height, peak_height, x, y) {
            var obsHt = 0;
            if (peak_height) {
                obsHt = peak_height;
            }
            var features3D = layerResults3d.features;
            var features2D = layerResults2d.features;
            var table3D = this.generateResultsGrid3D(layerResults3d, base_height, peak_height);
            domConstruct.place(table3D, article1);
            var table2D = this.generateResultsGrid2D(layerResults2d);
            domConstruct.place(table2D, article2);
            return popup_container;
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
        ObstructionResultsViewModel.prototype.generateMetaGrid3D = function (layerResults3d, base_height, peak_height) {
            var _this = this;
            var features3D = layerResults3d.features;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var table3D = domConstruct.create("table", { class: "table meta-table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h1 = domConstruct.create("th", { innerHTML: "Clearance (+ / - ft.)", class: "data-field" });
            var h2 = domConstruct.create("th", { innerHTML: "Approach Guidance", class: "metadata-field" });
            var h3 = domConstruct.create("th", { innerHTML: "Date Acquired", class: "metadata-field" });
            var h4 = domConstruct.create("th", { innerHTML: "Description", class: "metadata-field" });
            var h5 = domConstruct.create("th", { innerHTML: "Safety Regulation", class: "metadata-field" });
            var h6 = domConstruct.create("th", { innerHTML: "Zone Use", class: "metadata-field" });
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(h3, header_row);
            domConstruct.place(h4, header_row);
            domConstruct.place(h5, header_row);
            domConstruct.place(h6, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table3D);
            var tbody = domConstruct.create("tbody");
            var array3D = this.create3DArray(features3D, base_height, peak_height);
            array3D.forEach(function (obj) {
                var tr = domConstruct.create("tr");
                domAttr.set(tr, "data-layername", obj.layerName);
                var td = domConstruct.create("td", { innerHTML: obj.clearance, class: "data-field" });
                var td2 = domConstruct.create("td", { innerHTML: obj.guidance, class: "metadata-field" });
                var td3 = domConstruct.create("td", { innerHTML: obj.date_acquired, class: "metadata-field" });
                var td4 = domConstruct.create("td", { innerHTML: obj.description, class: "metadata-field" });
                var td5 = domConstruct.create("td", { innerHTML: obj.regulation, class: "metadata-field" });
                var td6 = domConstruct.create("td", { innerHTML: obj.zone_use, class: "metadata-field" });
                if (obj.clearance <= 0) {
                    domClass.add(td, "negative");
                }
                domConstruct.place(td, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(td3, tr);
                domConstruct.place(td4, tr);
                domConstruct.place(td5, tr);
                domConstruct.place(td6, tr);
                on(tr, "mouseover", function (evt) {
                    var layerName = domAttr.get(evt.currentTarget, "data-layername");
                    var layerID = layerName.toLowerCase().replace(" ", "_");
                    var target_layer = _this.scene.findLayerById(layerID);
                    target_layer.definitionExpression = "OBJECTID = " + obj.oid;
                    _this.setSingleLayerVisible(target_layer);
                });
                domConstruct.place(tr, tbody);
            });
            on(tbody, "mouseleave", function (evt) {
                _this.getDefaultLayerVisibility();
            });
            domConstruct.place(tbody, table3D);
            domConstruct.place(table3D, div_wrapper);
            return div_wrapper;
        };
        ObstructionResultsViewModel.prototype.generateResultsGrid2D = function (layerResults2d) {
            var _this = this;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var features2D = layerResults2d.features;
            var table2D = domConstruct.create("table", { class: "table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h1 = domConstruct.create("th", { innerHTML: "Surface Name" });
            var h2 = domConstruct.create("th", { innerHTML: "Description" });
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table2D);
            var tbody = domConstruct.create("tbody");
            var array2D = this.create2DArray(features2D);
            var highlight;
            array2D.forEach(function (obj) {
                var tr = domConstruct.create("tr");
                domAttr.set(tr, "data-layername", obj.layerName);
                var td = domConstruct.create("td", { innerHTML: obj.name });
                var td2 = domConstruct.create("td", { innerHTML: obj.description });
                domConstruct.place(td, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(tr, tbody);
                on(tr, "mouseover", function (evt) {
                    highlight = _this.highlight2DRow(evt, obj, highlight);
                });
            });
            on(tbody, "mouseleave", function (evt) {
                if (highlight) {
                    highlight.remove();
                }
            });
            domConstruct.place(tbody, table2D);
            domConstruct.place(table2D, div_wrapper);
            return div_wrapper;
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
        ObstructionResultsViewModel.prototype.generateMetaGrid2D = function (layerResults2d) {
            var _this = this;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var features2D = layerResults2d.features;
            var crit_2d_layer = this.scene.findLayerById("runwayhelipaddesignsurface");
            var aoa = this.scene.findLayerById("airoperationsarea");
            var table2D = domConstruct.create("table", { class: "table meta-table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h1 = domConstruct.create("th", { innerHTML: "Date Acquired" });
            var h2 = domConstruct.create("th", { innerHTML: "Data Source" });
            var h3 = domConstruct.create("th", { innerHTML: "Last Update" });
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(h3, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table2D);
            var tbody = domConstruct.create("tbody");
            var array2D = this.create2DArray(features2D);
            var highlight;
            array2D.forEach(function (obj) {
                var tr = domConstruct.create("tr");
                domAttr.set(tr, "data-layername", obj.layerName);
                var td = domConstruct.create("td", { innerHTML: obj.date_acquired, class: "metadata-field" });
                var td2 = domConstruct.create("td", { innerHTML: obj.data_source, class: "metadata-field" });
                var td3 = domConstruct.create("td", { innerHTML: obj.last_update, class: "metadata-field" });
                domConstruct.place(td, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(td3, tr);
                on(tr, "mouseover", function (evt) {
                    highlight = _this.highlight2DRow(evt, obj, highlight);
                });
                domConstruct.place(tr, tbody);
            });
            on(tbody, "mouseleave", function (evt) {
                if (highlight) {
                    highlight.remove();
                }
            });
            domConstruct.place(tbody, table2D);
            domConstruct.place(table2D, div_wrapper);
            return div_wrapper;
        };
        ObstructionResultsViewModel.prototype.create3DArray = function (features, base_height, obsHt) {
            var results = features.map(function (feature) {
                var surface_elevation = feature.attributes.Elev;
                var height_agl;
                var clearance;
                height_agl = Number((surface_elevation - base_height).toFixed(1));
                clearance = Number((height_agl - obsHt).toFixed(1));
                return ({
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
                });
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
        ObstructionResultsViewModel.prototype.generateResultsGrid3D = function (layerResults3d, base_height, peak_height) {
            var features3D = layerResults3d.features;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var table3D = domConstruct.create("table", { class: "table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h = domConstruct.create("th", { innerHTML: "Visibility Lock", class: "vis-field" });
            var h1 = domConstruct.create("th", { innerHTML: "Clearance (+ / - ft.)", class: "data-field" });
            var h2 = domConstruct.create("th", { innerHTML: "Surface Name", class: "data-field" });
            var h3 = domConstruct.create("th", { innerHTML: "Type", class: "data-field" });
            var h4 = domConstruct.create("th", { innerHTML: "Condition", class: "data-field" });
            var h5 = domConstruct.create("th", { innerHTML: "Runway", class: "data-field" });
            var h6 = domConstruct.create("th", { innerHTML: "Elevation Above Sea Level (ft.)", class: "data-field" });
            var h7 = domConstruct.create("th", { innerHTML: "Height Above Ground (ft.)", class: "data-field" });
            domConstruct.place(h, header_row);
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(h3, header_row);
            domConstruct.place(h4, header_row);
            domConstruct.place(h5, header_row);
            domConstruct.place(h6, header_row);
            domConstruct.place(h7, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table3D);
            var tbody = domConstruct.create("tbody");
            var array3D = this.create3DArray(features3D, base_height, peak_height);
            var table_rows;
            array3D.forEach(function (obj) {
                var tr = domConstruct.create("tr", { class: "3d-results-row", id: obj.oid + "_3d_result_row" });
                domAttr.set(tr, "data-layername", obj.layerName);
                var viz = domConstruct.create("label", { class: "toggle-switch" });
                var viz_input = domConstruct.create("input", { type: "checkbox", class: "toggle-switch-input", id: obj.oid + "_3d_result_switch" });
                if (table_rows && table_rows.length) {
                    table_rows.push([viz_input, tr]);
                }
                else {
                    table_rows = [[viz_input, tr]];
                }
                var viz_span = domConstruct.create("span", { class: "toggle-switch-track margin-right-1" });
                domConstruct.place(viz_input, viz);
                domConstruct.place(viz_span, viz);
                var td = domConstruct.create("td", { class: "vis-field" });
                domConstruct.place(viz, td);
                var td1 = domConstruct.create("td", { innerHTML: obj.clearance, class: "data-field" });
                var td2 = domConstruct.create("td", { innerHTML: obj.surface, class: "data-field" });
                var td3 = domConstruct.create("td", { innerHTML: obj.type, class: "data-field" });
                var td4 = domConstruct.create("td", { innerHTML: obj.condition, class: "data-field" });
                var td5 = domConstruct.create("td", { innerHTML: obj.runway, class: "data-field" });
                var td6 = domConstruct.create("td", { innerHTML: obj.elevation, class: "data-field" });
                var td7 = domConstruct.create("td", { innerHTML: obj.height, class: "data-field" });
                if (obj.clearance <= 0) {
                    domClass.add(td1, "negative");
                }
                domConstruct.place(td, tr);
                domConstruct.place(td1, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(td3, tr);
                domConstruct.place(td4, tr);
                domConstruct.place(td5, tr);
                domConstruct.place(td6, tr);
                domConstruct.place(td7, tr);
                domConstruct.place(tr, tbody);
            });
            domConstruct.place(tbody, table3D);
            domConstruct.place(table3D, div_wrapper);
            if (table_rows) {
                this.build3dTableConnections(tbody, table_rows);
            }
            return div_wrapper;
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
        ], ObstructionResultsViewModel.prototype, "obstructionSettings", void 0);
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
        ObstructionResultsViewModel = __decorate([
            decorators_1.subclass("widgets.App.ObstructionViewModel")
        ], ObstructionResultsViewModel);
        return ObstructionResultsViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = ObstructionResultsViewModel;
});
//# sourceMappingURL=ObstructionResultsViewModel.js.map