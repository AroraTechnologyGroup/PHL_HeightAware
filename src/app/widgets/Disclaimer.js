define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "./viewModels/DisclaimerViewModel"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, widget_1, DisclaimerViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Disclaimer = (function (_super) {
        tslib_1.__extends(Disclaimer, _super);
        function Disclaimer(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new DisclaimerViewModel_1.default();
            return _this;
        }
        Disclaimer.prototype.render = function () {
            return (widget_1.tsx("div", { id: "disclaimerPanel" },
                widget_1.tsx("div", { id: "title" },
                    widget_1.tsx("p", { class: "avenir-bold font-size-2" }, this.title)),
                widget_1.tsx("div", { id: "content" },
                    widget_1.tsx("p", { class: "avenir-light font-size-0" }, this.content)),
                widget_1.tsx("div", { id: "guide_link" },
                    widget_1.tsx("a", { href: this.guide_link, target: "_blank" }, "Link to User Guide"))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Disclaimer.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.title")
        ], Disclaimer.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.content")
        ], Disclaimer.prototype, "content", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], Disclaimer.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.guide_link")
        ], Disclaimer.prototype, "guide_link", void 0);
        Disclaimer = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.Disclaimer")
        ], Disclaimer);
        return Disclaimer;
    }(decorators_1.declared(Widget)));
    exports.Disclaimer = Disclaimer;
});
//# sourceMappingURL=Disclaimer.js.map