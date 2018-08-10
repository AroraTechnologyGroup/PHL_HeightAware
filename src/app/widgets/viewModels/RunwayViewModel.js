define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RunwayViewModel = (function (_super) {
        tslib_1.__extends(RunwayViewModel, _super);
        function RunwayViewModel(params) {
            return _super.call(this, params) || this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], RunwayViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RunwayViewModel.prototype, "view", void 0);
        RunwayViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.RunwayViewModel")
        ], RunwayViewModel);
        return RunwayViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = RunwayViewModel;
});
//# sourceMappingURL=RunwayViewModel.js.map