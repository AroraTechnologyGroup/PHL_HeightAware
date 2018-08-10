/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import LegendViewModel, { LegendParams } from "./viewModels/LegendViewModel";
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";

interface PanelProperties extends LegendParams, esri.WidgetProperties {}
import { renderable, tsx } from "esri/widgets/support/widget";


@subclass("app.widgets.legend_pane")
export class LegendPane extends declared(Widget) {

    @property() name = "Legend";

    @property() viewModel = new LegendViewModel();

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    render() {
        return(
            <div id="panelLegend" class="panel collapse">
                <div id="headingLegend" class="panel-heading" role="tab">
                    <div class="panel-title">
                        <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseLegend" aria-expanded="true" aria-controls="collapseLegend"><span class="icon-ui-layer-list" aria-hidden="true"></span><span class="panel-label">{this.name}</span></a> 
                        <a class="panel-close" role="button" data-toggle="collapse" href="#panelLegend"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a> 
                    </div>
                </div>
                <div id="collapseLegend" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingLegend">
                    <div class="panel-body body-light">            
                    <div id="legendDiv"></div>
                    </div>
                </div>
            </div>
        );
    }
}