define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/DirectLineMeasurement3D", "esri/widgets/AreaMeasurement3D", "dojo/dom-construct", "dojo/dom", "./viewModels/MeasureViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, DirectLineMeasurement3D, AreaMeasurement3D, domConstruct, dom, MeasureViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MeasurePane = (function (_super) {
        tslib_1.__extends(MeasurePane, _super);
        function MeasurePane(params) {
            var _this = _super.call(this, params) || this;
            _this.name = "Measure";
            _this.viewModel = new MeasureViewModel_1.default();
            return _this;
        }
        MeasurePane.prototype.postInitialize = function () {
        };
        MeasurePane.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { id: "measure3d", class: "panel collapse" },
                widget_1.tsx("div", { id: "headingMeasure", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseMeasure", "aria-expanded": "true", "aria-controls": "collapseMeasure" },
                            widget_1.tsx("span", { class: "icon-ui-upload", "arira-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", tabindex: "0", href: "#measure3d" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseMeasure", class: "panel-collapse collapse", role: "tabpanel", "area-labeledby": "headingMeasure" },
                    widget_1.tsx("div", { class: "body-light" },
                        widget_1.tsx("button", { id: "distanceBtn", onclick: function (e) { return _this.distanceEvent(e); }, class: "action-button esri-icon-minus", type: "button", title: "Measure distance between two points" }),
                        widget_1.tsx("button", { id: "areaBtn", onclick: function (e) { return _this.areaEvent(e); }, class: "action-button esri-icon-polygon", type: "button", title: "Measure Area" })),
                    widget_1.tsx("div", { id: "measureContainer" }))));
        };
        MeasurePane.prototype.distanceEvent = function (event) {
            this.setActiveWidget(null);
            if (!event.target.classList.contains("active")) {
                this.setActiveWidget("distance");
            }
            else {
                this.setActiveButton(null);
            }
        };
        MeasurePane.prototype.areaEvent = function (event) {
            this.setActiveWidget(null);
            if (!event.target.classList.contains("active")) {
                this.setActiveWidget("area");
            }
            else {
                this.setActiveButton(null);
            }
        };
        MeasurePane.prototype.setActiveWidget = function (type) {
            var _container = domConstruct.create("div");
            switch (type) {
                case "distance":
                    this.activeWidget = new DirectLineMeasurement3D({
                        view: this.view,
                        container: _container,
                        unitOptions: ["feet", "inches", "meters", "yards", "miles", "kilometers"]
                    });
                    this.setActiveButton(dom.byId("distanceBtn"));
                    break;
                case "area":
                    this.activeWidget = new AreaMeasurement3D({
                        view: this.view,
                        container: _container,
                        unitOptions: ["square-feet", "acres", "square-inches", "square-miles", "square-meters"]
                    });
                    this.setActiveButton(dom.byId("areaBtn"));
                    break;
                case null:
                    if (this.activeWidget) {
                        domConstruct.empty("measureContainer");
                        this.activeWidget.destroy();
                        this.activeWidget = null;
                    }
                    break;
            }
            domConstruct.place(_container, dom.byId("measureContainer"));
        };
        MeasurePane.prototype.setActiveButton = function (selectedButton) {
            this.view.focus();
            var elements = document.getElementsByClassName("active");
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove("active");
            }
            if (selectedButton) {
                selectedButton.classList.add("active");
            }
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], MeasurePane.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MeasurePane.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], MeasurePane.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], MeasurePane.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.activeWidget")
        ], MeasurePane.prototype, "activeWidget", void 0);
        MeasurePane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.measure_pane")
        ], MeasurePane);
        return MeasurePane;
    }(decorators_1.declared(Widget)));
    exports.MeasurePane = MeasurePane;
});
//# sourceMappingURL=MeasurePane.js.map