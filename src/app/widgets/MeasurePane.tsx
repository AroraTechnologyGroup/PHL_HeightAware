/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
/// <reference path="../../../node_modules/dojo-typings/dojo/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojo/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />

import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D";
import * as AreaMeasurement3D from "esri/widgets/AreaMeasurement3D";
import * as domConstruct from "dojo/dom-construct";
import * as dom from "dojo/dom";

import MeasureViewModel, { MeasureParams } from "./viewModels/MeasureViewModel";

interface PanelProperties extends MeasureParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";

@subclass("app.widgets.measure_pane")
export class MeasurePane extends declared(Widget) {

    @property() name = "Measure";

    @property() viewModel = new MeasureViewModel();

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    @aliasOf("viewModel.activeWidget") activeWidget: DirectLineMeasurement3D | AreaMeasurement3D | null;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    render() {
        return (
            <div id="measure3d" class="panel collapse">
                <div id="headingMeasure" class="panel-heading" role="tab">
                    <div class="panel-title">
                        <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseMeasure" aria-expanded="true" aria-controls="collapseMeasure"><span class="icon-ui-upload" arira-hidden="true"></span><span class="panel-label">{this.name}</span></a>
                        <a class="panel-close" role="button" data-toggle="collapse" tabindex="0" href="#measure3d"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
                    </div>
                </div>
                <div id="collapseMeasure" class="panel-collapse collapse" role="tabpanel" area-labeledby="headingMeasure">
                    <div class="body-light">
                        <button id="distanceBtn" onclick={(e: MouseEvent) => this.distanceEvent(e)} class="action-button esri-icon-minus" type="button" title="Measure distance between two points"></button>
                        <button id="areaBtn" onclick={(e: MouseEvent) => this.areaEvent(e)} class="action-button esri-icon-polygon" type="button" title="Measure Area"></button>
                    </div>
                    <div id="measureContainer"></div>
                </div>
            </div>
        );
    }

    private distanceEvent(event: MouseEvent) {
        this.setActiveWidget(null);
        if (!event.target.classList.contains("active")) {
            this.setActiveWidget("distance");
        } else {
            this.setActiveButton(null);
        }
    }

    private areaEvent(event: MouseEvent) {
        this.setActiveWidget(null);
        if (!event.target.classList.contains("active")) {
            this.setActiveWidget("area");
        } else {
            this.setActiveButton(null);
        }
    }

    private setActiveWidget(type: string | null) {
        const _container = domConstruct.create("div");
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
    }

    private setActiveButton(selectedButton: Element | null) {
        this.view.focus();
        const elements = document.getElementsByClassName("active");
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }
        if (selectedButton) {
            selectedButton.classList.add("active");
        }
    }
}


