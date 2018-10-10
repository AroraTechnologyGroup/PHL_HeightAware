define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/Accessor", "esri/widgets/support/widget", "esri/core/watchUtils", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, tslib_1, Accessor, widget_1, watchUtils_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DisclaimerViewModel = (function (_super) {
        tslib_1.__extends(DisclaimerViewModel, _super);
        function DisclaimerViewModel(params) {
            var _this = _super.call(this, params) || this;
            _this.title = "Application Usage Information";
            _this.guide_link = "./app/data/HeightAware3D_Documentation.pdf";
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        DisclaimerViewModel.prototype.onload = function () {
            this.content = "PHL HeightAware is designed for planning purposes only and does not replace any procedures or guidance from any Airport department.";
        };
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "view", void 0);
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "content", void 0);
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "guide_link", void 0);
        DisclaimerViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.DisclaimerViewModel")
        ], DisclaimerViewModel);
        return DisclaimerViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = DisclaimerViewModel;
});
//# sourceMappingURL=DisclaimerViewModel.js.map