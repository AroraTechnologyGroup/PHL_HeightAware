define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionPane = (function (_super) {
        tslib_1.__extends(ObstructionPane, _super);
        function ObstructionPane() {
            var _this = _super.call(this) || this;
            _this.name = "Obstruction Analysis";
            return _this;
        }
        ObstructionPane.prototype.postInitialize = function () {
        };
        ObstructionPane.prototype.render = function () {
            return (widget_1.tsx("div", { id: "obstructionPanel", class: "panel collapse in" },
                widget_1.tsx("div", { id: "headingObstruction", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseObstruction", "aria-expanded": "true", "aria-controls": "collapseObstruction" },
                            widget_1.tsx("span", { class: "glyphicon glyphicon-plane", "aria-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", tabindex: "0", href: "#obstructionPanel" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseObstruction", class: "panel-collapse collapse in", role: "tabpanel", "aria-labelledby": "headingObstruction" },
                    widget_1.tsx("div", { class: "body-light", id: "obstruction-flex" },
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("div", null,
                                widget_1.tsx("div", null, "Height of obstruction"),
                                widget_1.tsx("input", { id: "obsHeight", type: "number", placeholder: "in feet" })),
                            widget_1.tsx("div", null,
                                widget_1.tsx("div", null, "+/- Ground Elevation"),
                                widget_1.tsx("input", { id: "groundLevel", type: "number", placeholder: "feet above or below" }))),
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("div", { id: "xandy" },
                                widget_1.tsx("div", null,
                                    widget_1.tsx("div", null, "X: Easting"),
                                    widget_1.tsx("input", { id: "easting", type: "number", placeHolder: "Easting" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("div", null, "Y: Northing"),
                                    widget_1.tsx("input", { id: "northing", type: "number", placeHolder: "Northing" })))),
                        widget_1.tsx("div", { id: "target_btns" },
                            widget_1.tsx("div", { id: "activate_target", class: 'btn btn-transparent' }, "Activate"),
                            widget_1.tsx("div", { id: "obs_submit", class: 'btn btn-transparent' }, "Submit"))))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "name", void 0);
        ObstructionPane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.obstructionPane")
        ], ObstructionPane);
        return ObstructionPane;
    }(decorators_1.declared(Widget)));
    exports.ObstructionPane = ObstructionPane;
});
//# sourceMappingURL=ObstructionPane.js.map