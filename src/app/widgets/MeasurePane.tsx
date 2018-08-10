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
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";

import MeasureViewModel, { MeasureParams } from "./viewModels/MeasureViewModel";

interface PanelProperties extends MeasureParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";

@subclass("app.widgets.measure_pane")
export class MeasurePane extends declared(Widget) {

    @property() name = "Measure";

    @property() viewModel = new MeasureViewModel();

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

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
                        <div id="measureBtn" class="btn btn-clear">Activate Measure</div>
                    </div>
                </div>
            </div>
        );
    }
}


