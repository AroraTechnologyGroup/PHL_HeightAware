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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/aspect", "dojo/query", "dojo/_base/declare", "dojo/dom-class", "dgrid/Grid", "dgrid/extensions/ColumnHider", "dgrid/extensions/ColumnResizer", "dgrid/Selection", "dstore/Memory", "./viewModels/ObstructionResultsViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, aspect, query, declare, domClass, Grid, ColumnHider, ColumnResizer, Selection, Memory, ObstructionResultsViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionResults = (function (_super) {
        __extends(ObstructionResults, _super);
        function ObstructionResults(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new ObstructionResultsViewModel_1.default();
            _this.isSmall = true;
            _this.x = 0;
            _this.y = 0;
            _this.agl = 0;
            _this.msl = 0;
            _this.name = "Obstruction Results";
            _this.ground_elevation = 0;
            _this.elevation_change = 0;
            _this.modifiedBase = false;
            _this.count_3d = 0;
            _this.count_2d = 0;
            _this.store3d = new Memory({ data: [] });
            _this.store2d = new Memory({ data: [] });
            _this.defaultLayerVisibility = [];
            _this.selected_feature_visibility = {};
            return _this;
        }
        Object.defineProperty(ObstructionResults.prototype, "dem_source_change", {
            get: function () {
                var d;
                if (this.modifiedBase) {
                    d = this.dem_source + " (" + this.elevation_change.toFixed(2) + " ft.)";
                }
                else {
                    d = "" + this.dem_source;
                }
                return d;
            },
            enumerable: true,
            configurable: true
        });
        ObstructionResults.prototype.postInitialize = function () {
            var _this = this;
            var handle1 = this.watch("layerResults3d", function (newValue, oldValue, property, object) {
                _this.count_3d = newValue.features.length;
                var array3D = _this.viewModel.create3DArray(newValue.features, _this.ground_elevation, _this.agl);
                _this.viewModel.getDefaultLayerVisibility();
                _this.viewModel.removeGrid3dEvents();
                _this.results3d_grid.set("collection", _this.store3d.data);
                _this.results3d_grid.refresh();
                _this.results3d_grid.renderArray(_this.store3d.data);
                _this.viewModel.enableGrid3dEvents();
                _this.results3d_grid.resize();
            });
            var handle2 = this.watch("layerResults2d", function (newValue, oldValue, property, object) {
                _this.count_2d = newValue.features.length;
                var array2D = _this.viewModel.create2DArray(newValue.features);
                console.log(array2D);
                _this.viewModel.removeGrid2dEvents();
                _this.results2d_grid.set("collection", _this.store2d.data);
                _this.results2d_grid.refresh();
                _this.results2d_grid.renderArray(_this.store2d.data);
                _this.viewModel.enableGrid2dEvents();
                _this.results2d_grid.resize();
            });
            var handle3 = this.watch("defaultLayerVisibility", function (newValue) {
                _this.selected_feature_visibility = {};
                newValue.forEach(function (obj) {
                    _this.selected_feature_visibility[obj.id] = [];
                });
            });
            this.own([handle1, handle2, handle3]);
        };
        ObstructionResults.prototype.Click3d = function (event) {
            if (!domClass.contains(event.target, "is-active")) {
                var link3D = document.getElementById("tab_3d");
                var article1 = document.getElementById("results3d");
                var link2D = document.getElementById("tab_2d");
                var article2 = document.getElementById("results2d");
                domClass.add(link3D, "is-active");
                domClass.add(article1, "is-active");
                domClass.remove(link2D, "is-active");
                domClass.remove(article2, "is-active");
            }
            this.results3d_grid.resize();
        };
        ObstructionResults.prototype.Click2d = function (event) {
            if (!domClass.contains(event.target, "is-active")) {
                var link3D = document.getElementById("tab_3d");
                var article1 = document.getElementById("results3d");
                var link2D = document.getElementById("tab_2d");
                var article2 = document.getElementById("results2d");
                domClass.add(link2D, "is-active");
                domClass.add(article2, "is-active");
                domClass.remove(link3D, "is-active");
                domClass.remove(article1, "is-active");
            }
            this.results2d_grid.resize();
        };
        ObstructionResults.prototype.buildResults3d = function (element) {
            var columns = {
                oid: {
                    label: "Object ID",
                    hidden: true
                },
                clearance: {
                    label: "Clearance (+ / - ft.)",
                    className: "data-field",
                    unhideable: true
                },
                name: {
                    label: "Surface Name",
                    className: "data-field",
                    unhideable: true
                },
                type: {
                    label: "Type",
                    className: "data-field"
                },
                condition: {
                    label: "Condition",
                    className: "data-field",
                    hidden: true
                },
                runwayend: {
                    label: "Runway End",
                    className: "data-field"
                },
                runway: {
                    label: "Runway",
                    className: "data-field"
                },
                elevation: {
                    label: "MSL (ft.)",
                    className: "data-field"
                },
                height: {
                    label: "AGL (ft.)",
                    className: "data-field"
                },
                guidance: {
                    label: "Approach Guidance",
                    className: "metadata-field",
                    hidden: true
                },
                dateacquired: {
                    label: "Date Acquired",
                    className: "metadata-field",
                    hidden: true
                },
                description: {
                    label: "Description",
                    className: "metadata-field",
                    hidden: true
                },
                regulation: {
                    label: "Safety Regulation",
                    className: "metadata-field",
                    hidden: true
                },
                zoneuse: {
                    label: "Zone Use",
                    className: "metadata-field",
                    hidden: true
                }
            };
            var grid = this.results3d_grid = new (declare([Grid, Selection, ColumnHider, ColumnResizer]))({
                columns: columns,
                deselectOnRefresh: true
            }, element);
            aspect.after(grid, "renderRow", function (row, args) {
                try {
                    if (parseFloat(args[0].clearance) <= 0) {
                        var clearance_cell = query(".dgrid-cell.field-clearance", row);
                        if (clearance_cell.length) {
                            domClass.add(clearance_cell[0], "negative");
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                }
                return row;
            });
            grid.startup();
        };
        ObstructionResults.prototype.buildResults2d = function (element) {
            var columns = {
                oid: {
                    label: "Object ID",
                    hidden: true
                },
                layerName: {
                    label: "Layer Name",
                    hidden: true
                },
                name: {
                    label: "Surface Name",
                    unhideable: true,
                    className: "data-field"
                },
                description: {
                    label: "Description",
                    className: "data-field"
                },
                date: {
                    label: "Date Acquired",
                    className: "metadata-field",
                    hidden: true
                },
                datasource: {
                    label: "Data Source",
                    className: "metadata-field",
                    hidden: true
                },
                lastupdate: {
                    label: "Last Update",
                    className: "metadata-field",
                    hidden: true
                }
            };
            var grid = this.results2d_grid = new (declare([Grid, Selection, ColumnHider, ColumnResizer]))({
                columns: columns,
                selectionMode: "single",
                deselectOnRefresh: true
            }, element);
            grid.startup();
        };
        ObstructionResults.prototype.toggleMetadata = function (event) {
            var _this = this;
            var fields_3d = ["type", "runway", "runwayend", "elevation", "height", "guidance", "dateacquired", "description", "regulation", "zoneuse"];
            var fields_2d = ["description", "date", "datasource", "lastupdate"];
            fields_3d.forEach(function (field_id) {
                _this.results3d_grid.toggleColumnHiddenState(field_id);
            });
            fields_2d.forEach(function (field_id) {
                _this.results2d_grid.toggleColumnHiddenState(field_id);
            });
            domClass.toggle(event.target, "metadata-selected");
        };
        ObstructionResults.prototype.toggleSize = function () {
            var _this = this;
            if (this.isSmall) {
                this.isSmall = false;
            }
            else {
                this.isSmall = true;
            }
            setTimeout(function () {
                _this.results2d_grid.resize();
                _this.results3d_grid.resize();
            }, 1000);
        };
        ObstructionResults.prototype.render = function () {
            var _a, _b;
            var widget_sizing = (_a = {},
                _a["esri-widget small-widget"] = this.isSmall,
                _a["esri-widget big-widget"] = !this.isSmall,
                _a);
            var sizing_icon = (_b = {},
                _b["size-button icon-ui-overview-arrow-top-left"] = this.isSmall,
                _b["size-button icon-ui-overview-arrow-bottom-right"] = !this.isSmall,
                _b);
            return (widget_1.tsx("div", { id: "obstructionResults", class: this.classes(widget_sizing) },
                widget_1.tsx("span", { class: "icon-ui-organization", "aria-hidden": "true" }),
                widget_1.tsx("span", { class: "panel-label" },
                    widget_1.tsx("b", null, this.name)),
                widget_1.tsx("div", { class: this.classes(sizing_icon), bind: this, onclick: this.toggleSize }),
                widget_1.tsx("div", { class: "obstruction-params" },
                    widget_1.tsx("b", null, "x:"),
                    " ",
                    this.x,
                    " feet",
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "y:"),
                    " ",
                    this.y,
                    " feet",
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "Ground Elevation:"),
                    " ",
                    this.ground_elevation,
                    " feet MSL ",
                    widget_1.tsx("i", null,
                        "source:",
                        this.dem_source_change),
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "Obstruction Height AGL:"),
                    " ",
                    this.agl,
                    " feet",
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "Obstruction Elevation MSL:"),
                    " ",
                    this.msl,
                    " feet",
                    widget_1.tsx("br", null)),
                widget_1.tsx("div", { class: "js-tab-group" },
                    widget_1.tsx("nav", { class: "tab-nav" },
                        widget_1.tsx("a", { id: "tab_3d", class: "tab-title is-active", onclick: this.Click3d.bind(this) },
                            "3D Surfaces (",
                            this.count_3d,
                            ")"),
                        widget_1.tsx("a", { id: "tab_2d", class: "tab-title", onclick: this.Click2d.bind(this) },
                            "2D Surfaces (",
                            this.count_2d,
                            ")"),
                        widget_1.tsx("a", { id: "metadata", class: "tab-title", onclick: this.toggleMetadata.bind(this) }, "metadata fields")),
                    widget_1.tsx("section", { class: "tab-contents" },
                        widget_1.tsx("article", { id: "results3d", class: "results_panel tab-section js-tab-section is-active" },
                            widget_1.tsx("div", { afterCreate: this.buildResults3d.bind(this) })),
                        widget_1.tsx("article", { id: "results2d", class: "results_panel tab-section js-tab-section" },
                            widget_1.tsx("div", { afterCreate: this.buildResults2d.bind(this) }))))));
        };
        __decorate([
            decorators_1.property()
        ], ObstructionResults.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionResults.prototype, "isSmall", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], ObstructionResults.prototype, "scene", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], ObstructionResults.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.x")
        ], ObstructionResults.prototype, "x", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.y")
        ], ObstructionResults.prototype, "y", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.agl")
        ], ObstructionResults.prototype, "agl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.msl")
        ], ObstructionResults.prototype, "msl", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.name")
        ], ObstructionResults.prototype, "name", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.ground_elevation")
        ], ObstructionResults.prototype, "ground_elevation", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.elevation_change")
        ], ObstructionResults.prototype, "elevation_change", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.modifiedBase")
        ], ObstructionResults.prototype, "modifiedBase", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.dem_source")
        ], ObstructionResults.prototype, "dem_source", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerResults3d")
        ], ObstructionResults.prototype, "layerResults3d", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerResults2d")
        ], ObstructionResults.prototype, "layerResults2d", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.count_3d")
        ], ObstructionResults.prototype, "count_3d", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.count_2d")
        ], ObstructionResults.prototype, "count_2d", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.expand")
        ], ObstructionResults.prototype, "expand", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.results3d_grid")
        ], ObstructionResults.prototype, "results3d_grid", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.results2d_grid")
        ], ObstructionResults.prototype, "results2d_grid", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.store3d")
        ], ObstructionResults.prototype, "store3d", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.store2d")
        ], ObstructionResults.prototype, "store2d", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.defaultLayerVisibility")
        ], ObstructionResults.prototype, "defaultLayerVisibility", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selected_feature_visibility")
        ], ObstructionResults.prototype, "selected_feature_visibility", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.highlight2d")
        ], ObstructionResults.prototype, "highlight2d", void 0);
        ObstructionResults = __decorate([
            decorators_1.subclass("app.widgets.obstructionResults")
        ], ObstructionResults);
        return ObstructionResults;
    }(decorators_1.declared(Widget)));
    exports.ObstructionResults = ObstructionResults;
});
//# sourceMappingURL=ObstructionResults.js.map