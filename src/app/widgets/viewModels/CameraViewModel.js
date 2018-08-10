define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CameraViewModel = (function (_super) {
        tslib_1.__extends(CameraViewModel, _super);
        function CameraViewModel(params) {
            return _super.call(this, params) || this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], CameraViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], CameraViewModel.prototype, "view", void 0);
        CameraViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.CameraViewModel")
        ], CameraViewModel);
        return CameraViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = CameraViewModel;
});
//# sourceMappingURL=CameraViewModel.js.map