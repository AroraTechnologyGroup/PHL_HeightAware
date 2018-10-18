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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/dom-class", "./viewModels/ObstructionResultsViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, domClass, ObstructionResultsViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionResults = (function (_super) {
        __extends(ObstructionResults, _super);
        function ObstructionResults(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new ObstructionResultsViewModel_1.default();
            _this.name = "Obstruction Results";
            return _this;
        }
        ObstructionResults.prototype.postInitialize = function () {
        };
        ObstructionResults.prototype._2dClick = function (element) {
            if (!domClass.contains(element, "is-active")) {
                var link3D = document.getElementById("3d_tab");
                var article1 = document.getElementById("results3d");
                var article1_meta = document.getElementById("results3d_meta");
                var link2D = document.getElementById("2d_tab");
                var article2 = document.getElementById("results2d");
                var article2_meta = document.getElementById("results2d_meta");
                domClass.add(link3D, "is-active");
                domClass.add(article1, "is-active");
                domClass.add(article1_meta, "is-active");
                domClass.remove(link2D, "is-active");
                domClass.remove(article2, "is-active");
                domClass.remove(article2_meta, "is-active");
            }
        };
        ObstructionResults.prototype._3dClick = function (element) {
            if (!domClass.contains(element, "is-active")) {
                var link3D = document.getElementById("3d_tab");
                var article1 = document.getElementById("results3d");
                var article1_meta = document.getElementById("results3d_meta");
                var link2D = document.getElementById("2d_tab");
                var article2 = document.getElementById("results2d");
                var article2_meta = document.getElementById("results2d_meta");
                domClass.add(link3D, "is-active");
                domClass.add(article1, "is-active");
                domClass.add(article1_meta, "is-active");
                domClass.remove(link2D, "is-active");
                domClass.remove(article2, "is-active");
                domClass.remove(article2_meta, "is-active");
            }
        };
        ObstructionResults.prototype.render = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", null,
                    widget_1.tsx("b", null, "x:"),
                    this.x,
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "y:"),
                    this.y,
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "Ground Elevation:"),
                    this.obstructionSettings.groundElevation,
                    " feet MSL ",
                    widget_1.tsx("i", null,
                        "source:",
                        this.obstructionSettings.dem_source),
                    widget_1.tsx("br", null),
                    widget_1.tsx("b", null, "Obstruction Height:"),
                    this.peak,
                    " feet",
                    widget_1.tsx("br", null)),
                widget_1.tsx("div", { class: "trailer-2 js-tab-group" },
                    widget_1.tsx("nav", { class: "tab-nav" },
                        widget_1.tsx("a", { id: "3d_tab", class: "tab-title is-active js-tab", onClick: this._3dClick, bind: this },
                            "3D Surfaces (",
                            this.obstructionSettings.layerResults3d.features.length,
                            ")"),
                        widget_1.tsx("a", { id: "2d_tab", class: "tab-title js-tab", onClick: this._2dClick },
                            "2D Surfaces (",
                            this.obstructionSettings.layerResults2d.features.length,
                            ")")),
                    widget_1.tsx("section", { class: "tab-contents" },
                        widget_1.tsx("article", { id: "results3d", class: "results_panel tab-section js-tab-section is-active" }),
                        widget_1.tsx("article", { id: "results2d", class: "results_panel tab-section js-tab-section" }),
                        widget_1.tsx("article", { id: "results3d_meta", class: "results_panel-meta tab-section js-tab-section" }),
                        widget_1.tsx("article", { id: "results2d_meta", class: "results_panel-meta tab-section js-tab-section" })))));
        };
        __decorate([
            decorators_1.property()
        ], ObstructionResults.prototype, "viewModel", void 0);
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
            decorators_1.aliasOf("viewModel.peak")
        ], ObstructionResults.prototype, "peak", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.name")
        ], ObstructionResults.prototype, "name", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.groundElevation")
        ], ObstructionResults.prototype, "groundElevation", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.modifiedBase")
        ], ObstructionResults.prototype, "modifiedBase", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.dem_source")
        ], ObstructionResults.prototype, "dem_source", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.obstructionSettings")
        ], ObstructionResults.prototype, "obstructionSettings", void 0);
        ObstructionResults = __decorate([
            decorators_1.subclass("app.widgets.obstructionResults")
        ], ObstructionResults);
        return ObstructionResults;
    }(decorators_1.declared(Widget)));
    exports.ObstructionResults = ObstructionResults;
});
//# sourceMappingURL=ObstructionResults.js.map