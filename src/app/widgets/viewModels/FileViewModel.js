define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileViewModel = (function (_super) {
        tslib_1.__extends(FileViewModel, _super);
        function FileViewModel(params) {
            return _super.call(this, params) || this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], FileViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], FileViewModel.prototype, "view", void 0);
        FileViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.FileViewModel")
        ], FileViewModel);
        return FileViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = FileViewModel;
});
//# sourceMappingURL=FileViewModel.js.map