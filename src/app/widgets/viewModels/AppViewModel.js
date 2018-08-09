define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/watchUtils", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, watchUtils_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AppViewModel = (function (_super) {
        tslib_1.__extends(AppViewModel, _super);
        function AppViewModel(params) {
            var _this = _super.call(this, params) || this;
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        AppViewModel.prototype.onload = function () {
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], AppViewModel.prototype, "view", void 0);
        AppViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.AppViewModel")
        ], AppViewModel);
        return AppViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = AppViewModel;
});
//# sourceMappingURL=AppViewModel.js.map