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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/widgets/support/widget", "esri/core/watchUtils", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, Accessor, widget_1, watchUtils_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DisclaimerViewModel = (function (_super) {
        __extends(DisclaimerViewModel, _super);
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
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "title", void 0);
        __decorate([
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "view", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "content", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "guide_link", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "drawer", void 0);
        __decorate([
            decorators_1.property()
        ], DisclaimerViewModel.prototype, "closeEvent", void 0);
        DisclaimerViewModel = __decorate([
            decorators_1.subclass("widgets.App.DisclaimerViewModel")
        ], DisclaimerViewModel);
        return DisclaimerViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = DisclaimerViewModel;
});
//# sourceMappingURL=DisclaimerViewModel.js.map