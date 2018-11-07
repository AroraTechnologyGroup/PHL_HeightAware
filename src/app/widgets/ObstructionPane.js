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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/CoordinateConversion", "./viewModels/ObstructionViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, watchUtils, CoordinateConversion, ObstructionViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionPane = (function (_super) {
        __extends(ObstructionPane, _super);
        function ObstructionPane(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new ObstructionViewModel_1.default();
            _this.name = "Obstruction Panel";
            _this.activated = false;
            _this.modifiedBase = false;
            return _this;
        }
        Object.defineProperty(ObstructionPane.prototype, "status", {
            get: function () {
                var d;
                if (this.activated) {
                    d = "Deactivate";
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
            var _this = this;
            var handle1 = watchUtils.when(this, "activated", function (event) {
                _this.results.expand.collapse();
            });
            var handle2 = watchUtils.whenFalse(this, "activated", function (event) {
                if (_this.mouse_track) {
                    _this.mouse_track.remove();
                }
                if (_this.view_click) {
                    _this.view_click.remove();
                }
                _this.view.graphics.removeAll();
            });
            this.own([handle1, handle2]);
        };
        ObstructionPane.prototype._placeCCWidget = function (element) {
            var ccWidget = new CoordinateConversion({
                view: this.view,
                container: element
            });
            this.ccViewModel = ccWidget.viewModel;
        };
        ObstructionPane.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { id: "obstructionPanel", class: "esri-widget" },
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
                            widget_1.tsx("div", { id: "ccNode", afterCreate: this._placeCCWidget, bind: this })),
                        widget_1.tsx("div", { id: "target_btns" },
                            widget_1.tsx("div", { id: "activate_target", onclick: function (e) { return _this.viewModel.toggleActivation(e); }, class: "btn btn-transparent" }, this.status),
                            widget_1.tsx("div", { id: "obs_submit", onclick: function (e) { return _this.viewModel.submitPanel(e); }, class: "btn btn-transparent" }, "Submit"))))));
        };
        __decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], ObstructionPane.prototype, "scene", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], ObstructionPane.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.name")
        ], ObstructionPane.prototype, "name", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.activated")
        ], ObstructionPane.prototype, "activated", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.ground_elevation")
        ], ObstructionPane.prototype, "ground_elevation", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.ccWidgetViewModel")
        ], ObstructionPane.prototype, "ccViewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.results")
        ], ObstructionPane.prototype, "results", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.modifiedBase")
        ], ObstructionPane.prototype, "modifiedBase", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mouse_track")
        ], ObstructionPane.prototype, "mouse_track", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view_click")
        ], ObstructionPane.prototype, "view_click", void 0);
        ObstructionPane = __decorate([
            decorators_1.subclass("app.widgets.obstructionPane")
        ], ObstructionPane);
        return ObstructionPane;
    }(decorators_1.declared(Widget)));
    exports.ObstructionPane = ObstructionPane;
});
//# sourceMappingURL=ObstructionPane.js.map