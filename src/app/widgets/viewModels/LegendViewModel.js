define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LegendViewModel = (function (_super) {
        tslib_1.__extends(LegendViewModel, _super);
        function LegendViewModel(params) {
            return _super.call(this, params) || this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], LegendViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LegendViewModel.prototype, "view", void 0);
        LegendViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.LegendViewModel")
        ], LegendViewModel);
        return LegendViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = LegendViewModel;
});
//# sourceMappingURL=LegendViewModel.js.map