define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./viewModels/LegendViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, LegendViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LegendPane = (function (_super) {
        tslib_1.__extends(LegendPane, _super);
        function LegendPane(params) {
            var _this = _super.call(this, params) || this;
            _this.name = "Legend";
            _this.viewModel = new LegendViewModel_1.default();
            return _this;
        }
        LegendPane.prototype.postInitialize = function () {
        };
        LegendPane.prototype.render = function () {
            return (widget_1.tsx("div", { id: "panelLegend", class: "panel collapse" },
                widget_1.tsx("div", { id: "headingLegend", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseLegend", "aria-expanded": "true", "aria-controls": "collapseLegend" },
                            widget_1.tsx("span", { class: "icon-ui-layer-list", "aria-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", href: "#panelLegend" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseLegend", class: "panel-collapse collapse", role: "tabpanel", "aria-labelledby": "headingLegend" },
                    widget_1.tsx("div", { class: "panel-body body-light" },
                        widget_1.tsx("div", { id: "legendDiv" })))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], LegendPane.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LegendPane.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], LegendPane.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], LegendPane.prototype, "view", void 0);
        LegendPane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.legend_pane")
        ], LegendPane);
        return LegendPane;
    }(decorators_1.declared(Widget)));
    exports.LegendPane = LegendPane;
});
//# sourceMappingURL=LegendPane.js.map