define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObstructionViewModel = (function (_super) {
        tslib_1.__extends(ObstructionViewModel, _super);
        function ObstructionViewModel(params) {
            return _super.call(this, params) || this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "view", void 0);
        ObstructionViewModel = tslib_1.__decorate([
            decorators_1.subclass("widgets.App.PanelViewModel")
        ], ObstructionViewModel);
        return ObstructionViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = ObstructionViewModel;
});
//# sourceMappingURL=ObstructionViewModel.js.map