define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RunwayPane = (function (_super) {
        tslib_1.__extends(RunwayPane, _super);
        function RunwayPane(params) {
            var _this = _super.call(this, params) || this;
            _this.name = "Runway Selector";
            return _this;
        }
        RunwayPane.prototype.postInitialize = function () {
        };
        RunwayPane.prototype.render = function () {
            return (widget_1.tsx("div", { id: "runwayPanel", class: "panel collapse" },
                widget_1.tsx("div", { id: "headingRunway", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseRunway", "aria-expanded": "true", "aria-controls": "collapseRunway" },
                            widget_1.tsx("span", { class: "glyphicon glyphicon-road", "aria-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", href: "#runwayPanel" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseRunway", class: "panel-collapse collapse", role: "tabpanel", "aria-labelledby": "headingRunway" },
                    widget_1.tsx("div", { class: "body-light" },
                        widget_1.tsx("div", { class: "grid-container" },
                            widget_1.tsx("div", { class: "column-1 left", id: "arrive" },
                                widget_1.tsx("div", null, "Arrivals"),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "9L" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "9R" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "27R" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "27L" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "17" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "26" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "35" }))),
                            widget_1.tsx("div", { class: "column-1", id: "runway_selector" },
                                widget_1.tsx("div", null, "Runways"),
                                widget_1.tsx("div", null, "9L"),
                                widget_1.tsx("div", null, "9R"),
                                widget_1.tsx("div", null, "27R"),
                                widget_1.tsx("div", null, "27L"),
                                widget_1.tsx("div", null, "17"),
                                widget_1.tsx("div", null, "26"),
                                widget_1.tsx("div", null, "35")),
                            widget_1.tsx("div", { class: "column-1", id: "depart" },
                                widget_1.tsx("div", null, "Departures"),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "9L" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "9R" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "27R" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "27L" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "17" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "26" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("input", { type: "checkbox", class: "runway", value: "35" }))))))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], RunwayPane.prototype, "name", void 0);
        RunwayPane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.runway_pane")
        ], RunwayPane);
        return RunwayPane;
    }(decorators_1.declared(Widget)));
    exports.RunwayPane = RunwayPane;
});
//# sourceMappingURL=RunwayPane.js.map