define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MeasureViewModel = (function (_super) {
        tslib_1.__extends(MeasureViewModel, _super);
        function MeasureViewModel(params) {
            return _super.call(this, params) || this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], MeasureViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MeasureViewModel.prototype, "view", void 0);
        MeasureViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.RunwayViewModel")
        ], MeasureViewModel);
        return MeasureViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = MeasureViewModel;
});
//# sourceMappingURL=MeasureViewModel.js.map