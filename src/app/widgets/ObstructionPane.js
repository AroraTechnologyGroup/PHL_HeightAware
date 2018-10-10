define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./viewModels/ObstructionViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, ObstructionViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionPane = (function (_super) {
        tslib_1.__extends(ObstructionPane, _super);
        function ObstructionPane(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new ObstructionViewModel_1.default();
            _this.name = "Obstruction Panel";
            _this.activated = false;
            return _this;
        }
        Object.defineProperty(ObstructionPane.prototype, "status", {
            get: function () {
                var d;
                if (this.activated) {
                    d = "Activated";
                }
                else {
                    d = "Activate";
                }
                return d;
            },
            enumerable: true,
            configurable: true
        });
        ObstructionPane.prototype.postInitialize = function () {
        };
        ObstructionPane.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { id: "obstructionPanel" },
                widget_1.tsx("div", { id: "headingObstruction" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("span", { class: "icon-ui-organization", "aria-hidden": "true" }),
                        widget_1.tsx("span", { class: "panel-label" }, this.name))),
                widget_1.tsx("div", { id: "collapseObstruction" },
                    widget_1.tsx("div", { class: "body-light", id: "obstruction-flex" },
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("label", null,
                                widget_1.tsx("input", { id: "obsHeight", type: "number", placeholder: "Height of Obstruction", title: "Height of Obstruction in feet" })),
                            widget_1.tsx("label", null,
                                widget_1.tsx("input", { id: "groundLevel", type: "number", placeholder: "+/- Ground Elevation", title: "+/- Ground Elevation in feet" }))),
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("div", { id: "xandy" },
                                widget_1.tsx("label", null,
                                    widget_1.tsx("input", { id: "easting", type: "number", placeHolder: "X: Easting", title: "X: Easting in feet" })),
                                widget_1.tsx("label", null,
                                    widget_1.tsx("input", { id: "northing", type: "number", placeHolder: "Y: Northing", title: "Y: Northing in feet" })))),
                        widget_1.tsx("div", { id: "target_btns" },
                            widget_1.tsx("div", { id: "activate_target", onclick: function (e) { return _this.viewModel.activate(e); }, class: "btn btn-transparent" }, this.status),
                            widget_1.tsx("div", { id: "deactivate_target", onclick: function (e) { return _this.viewModel.deactivate(e); }, class: "btn btn-transparent" }, "Deactivate"),
                            widget_1.tsx("div", { id: "obs_submit", onclick: function (e) { return _this.viewModel.submitPanel(e); }, class: "btn btn-transparent" }, "Submit"))))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], ObstructionPane.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], ObstructionPane.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.name")
        ], ObstructionPane.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.activated")
        ], ObstructionPane.prototype, "activated", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.ground_elevation")
        ], ObstructionPane.prototype, "ground_elevation", void 0);
        ObstructionPane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.obstructionPane")
        ], ObstructionPane);
        return ObstructionPane;
    }(decorators_1.declared(Widget)));
    exports.ObstructionPane = ObstructionPane;
});
//# sourceMappingURL=ObstructionPane.js.map