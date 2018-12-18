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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "./viewModels/DisclaimerViewModel", "dojo/query", "dojo/dom-class", "dojo/dom-construct"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, DisclaimerViewModel_1, query, domClass, domConstruct) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Disclaimer = (function (_super) {
        __extends(Disclaimer, _super);
        function Disclaimer(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new DisclaimerViewModel_1.default();
            return _this;
        }
        Disclaimer.prototype.postInitialize = function () {
            var _this = this;
            var handle1 = this.forceOpen = this.watch("drawer.expanded", function (event) {
                _this.drawer.expand();
            });
            this.own([handle1]);
        };
        Disclaimer.prototype.toggleDisclaimer = function (event) {
            var input = query("input", event.currentTarget)[0];
            var btn = query("button", "optin_container")[0];
            if (!input.checked) {
                input.checked = true;
                domClass.remove(btn, "btn-disabled");
            }
            else {
                input.checked = false;
                domClass.add(btn, "btn-disabled");
            }
        };
        Disclaimer.prototype.closePanel = function () {
            this.forceOpen.remove();
            this.drawer.collapse();
            domConstruct.destroy("user_optin");
        };
        Disclaimer.prototype.render = function () {
            return (widget_1.tsx("div", { id: "disclaimerPanel", class: "esri-widget" },
                widget_1.tsx("div", { id: "title" },
                    widget_1.tsx("div", { id: "guide_link" },
                        widget_1.tsx("a", { href: this.guide_link, target: "_blank" }, "Link to User Guide")),
                    widget_1.tsx("p", { class: "avenir-bold font-size-1" }, this.title)),
                widget_1.tsx("div", { id: "content" },
                    widget_1.tsx("p", { class: "avenir-light font-size-0" }, this.content)),
                widget_1.tsx("div", { id: "optin_container" },
                    widget_1.tsx("div", { id: "user_optin", onclick: this.toggleDisclaimer, bind: this },
                        widget_1.tsx("input", { name: "disc_check", type: "checkbox" }),
                        widget_1.tsx("label", { for: "disc_check" }, "I agree to the above disclaimer")),
                    widget_1.tsx("button", { class: "btn btn-disabled", onclick: this.closePanel, bind: this }, "Proceed"))));
        };
        __decorate([
            decorators_1.property()
        ], Disclaimer.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.title")
        ], Disclaimer.prototype, "title", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.content")
        ], Disclaimer.prototype, "content", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view")
        ], Disclaimer.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.guide_link")
        ], Disclaimer.prototype, "guide_link", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.drawer")
        ], Disclaimer.prototype, "drawer", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.forceOpen")
        ], Disclaimer.prototype, "forceOpen", void 0);
        Disclaimer = __decorate([
            decorators_1.subclass("app.widgets.Disclaimer")
        ], Disclaimer);
        return Disclaimer;
    }(decorators_1.declared(Widget)));
    exports.Disclaimer = Disclaimer;
});
//# sourceMappingURL=Disclaimer.js.map