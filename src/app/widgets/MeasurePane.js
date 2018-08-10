define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./viewModels/MeasureViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, MeasureViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MeasurePane = (function (_super) {
        tslib_1.__extends(MeasurePane, _super);
        function MeasurePane(params) {
            var _this = _super.call(this, params) || this;
            _this.name = "Measure";
            _this.viewModel = new MeasureViewModel_1.default();
            return _this;
        }
        MeasurePane.prototype.postInitialize = function () {
        };
        MeasurePane.prototype.render = function () {
            return (widget_1.tsx("div", { id: "measure3d", class: "panel collapse" },
                widget_1.tsx("div", { id: "headingMeasure", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseMeasure", "aria-expanded": "true", "aria-controls": "collapseMeasure" },
                            widget_1.tsx("span", { class: "icon-ui-upload", "arira-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", tabindex: "0", href: "#measure3d" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseMeasure", class: "panel-collapse collapse", role: "tabpanel", "area-labeledby": "headingMeasure" },
                    widget_1.tsx("div", { class: "body-light" },
                        widget_1.tsx("div", { id: "measureBtn", class: "btn btn-clear" }, "Activate Measure")))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], MeasurePane.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MeasurePane.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], MeasurePane.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], MeasurePane.prototype, "view", void 0);
        MeasurePane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.measure_pane")
        ], MeasurePane);
        return MeasurePane;
    }(decorators_1.declared(Widget)));
    exports.MeasurePane = MeasurePane;
});
//# sourceMappingURL=MeasurePane.js.map